/** Host OpenMAIC connection reuses DSH's protected credential provider. */
import { createHash } from 'node:crypto'
import { Context, Service } from '@deepseek-ai/cordis'
import { credentialKey, credentialRef } from '@deepseek-ai/dsh-credentials'
import z from '@deepseek-ai/schemastery'
import { OpenmaicConnection, type OpenmaicConnectionConfig } from './connection.ts'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { OpenmaicBrowser } from './browser.ts'
import { OpenmaicGeneration } from './generation.ts'

declare module '@deepseek-ai/cordis' { interface Context { /** Protected account transport and official job recovery, without learning writes. */ studentOpenmaic: StudentOpenmaic } }
/** Host account settings name credential references; secret values stay in credentials-local. */
export interface StudentOpenmaicConfig extends OpenmaicConnectionConfig { browserProfileRoot: string }
/** Host defaults for the official service, credential references and private browser root. */
export const openmaicConfig: z<StudentOpenmaicConfig> = z.object({
  browserProfileRoot: z.string().default(''),
  baseUrl: z.string().default('https://open.maic.chat'),
  accountBaseUrl: z.string().default('https://maic.chat/api'),
  accountRef: z.string().default('OPEN_MAIC_USER'),
  passwordRef: z.string().default('OPEN_MAIC_PASSWORD'),
  accessCodeRef: z.string().default('OPEN_MAIC_ACCESS_CODE'),
  tokenRef: z.string().default('OPENMAIC_AUTH_TOKEN'),
  accountId: z.string().default(''),
})
/** Installed once at Host scope, shared by every Student agent. */
export class StudentOpenmaic extends Service {
  static inject = ['credentials']
  static Config = openmaicConfig
  /** Verified account transport shared across Student conversations. */
  readonly connection: OpenmaicConnection
  /** Dedicated Chrome profile and process owned by this service. */
  readonly browser: OpenmaicBrowser
  private readonly generations = new Map<string, OpenmaicGeneration>()
  constructor(ctx: Context, config: StudentOpenmaicConfig) {
    super(ctx, 'studentOpenmaic')
    for (const ref of [config.accountRef, config.passwordRef, config.accessCodeRef, config.tokenRef]) if (ref) credentialRef(ref)
    const authKey = credentialKey('student-openmaic', `account-${createHash('sha256').update(JSON.stringify([config.baseUrl, config.accountBaseUrl, config.accountRef, config.accountId])).digest('hex')}`)
    this.connection = new OpenmaicConnection(config, {
      async resolve(ref) { return ref ? (await ctx.credentials.resolve(credentialRef(ref)))?.value : undefined },
      async load() { const record = await ctx.credentials.readRecord(authKey); return record?.kind === 'grant' ? record.payload : undefined },
      async save(payload) { await ctx.credentials.modifyRecord(authKey, async () => ({ kind: 'grant', payload })) },
    })
    this.browser = new OpenmaicBrowser(this.connection, {
      profileRoot: config.browserProfileRoot || join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'student-openmaic-browser'),
      async credentials() { const account = await ctx.credentials.resolve(credentialRef(config.accountRef)); const password = await ctx.credentials.resolve(credentialRef(config.passwordRef)); return account && password ? { account: account.value, password: password.value } : undefined },
    })
    ctx.effect(() => () => this.browser.dispose(), 'student-openmaic: browser')
  }
  /**
   * Recover jobs within their original workspace, learner, term and learning block.
   * @param workspace - Original Student workspace path from the authorized agent.
   * @returns Workspace-scoped official job transport.
   */
  generation(workspace: string): OpenmaicGeneration {
    let generation = this.generations.get(workspace)
    if (!generation) {
      const key = (owner: { learnerId: string; termId: string; blockId: string }) => credentialKey('student-openmaic', `job-${createHash('sha256').update(JSON.stringify([workspace, owner.learnerId, owner.termId, owner.blockId])).digest('hex')}`)
      generation = new OpenmaicGeneration(this.connection, {
        load: async owner => { const record = await this.ctx.credentials.readRecord(key(owner)); return record?.kind === 'grant' ? record.payload : undefined },
        save: async (owner, payload) => { await this.ctx.credentials.modifyRecord(key(owner), async () => ({ kind: 'grant', payload })) },
      })
      this.generations.set(workspace, generation)
    }
    return generation
  }
}
