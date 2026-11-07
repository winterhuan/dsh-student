# @winterhuan/dsh-student

English | [中文](README.zh.md)

Short daily learning, confirmed curricula and spaced mistake review for primary-school students.

[Plugin documentation](packages/winterhuan/student/README.md) · [Release package](https://github.com/winterhuan/dsh-student/releases/download/v0.1.1/winterhuan-dsh-student-0.1.1.tgz)

For DSH `0.2.2-rc.1`, enable Custom plugin market and add `https://winterhuan.github.io/dsh-creative/index.json` in Discover. Alternatively, install the prebuilt Git version with pnpm 11.7.0:

```sh
dsh plugin --profile market add 'git+https://github.com/winterhuan/dsh-student.git#d65b9eec560259b6efc19b7ef4bad9791dad8657&path:/packages/winterhuan/student'
```

Replace `market` with the name of your existing DSH profile.

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
