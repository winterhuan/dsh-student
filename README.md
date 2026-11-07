# @winterhuan/dsh-student

English | [中文](README.zh.md)

Short daily learning, confirmed curricula and spaced mistake review for primary-school students.

[Plugin documentation](packages/winterhuan/student/README.md) · [Release package](https://github.com/winterhuan/dsh-student/releases/download/v0.1.0/winterhuan-dsh-student-0.1.0.tgz)

Use pnpm 10.28.0 to install Release URLs into DSH profiles; pnpm 11 can reject them with `MISSING_TARBALL_INTEGRITY`. Repository builds use pnpm 11.7.0.

Use Node 24 (default) or Node 22.19 and later, with pnpm 11.7.0.

```sh
git clone https://github.com/winterhuan/dsh-student.git
cd dsh-student
git submodule update --init
pnpm install
pnpm run typecheck
pnpm run build
pnpm test
```

The upstream submodule supplies client test sources. Builds use the published DSH dependencies. The plugin source is in `packages/winterhuan/student`.
