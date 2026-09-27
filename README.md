<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Piqnex backend

This is the standalone backend for Piqnex, replacing Supabase. It's a
[Nest](https://github.com/nestjs/nest) (v11, CommonJS) project with
[Prisma](https://www.prisma.io/) as the ORM. See `../API_SPEC.md` and
`../piqnex_api_tracker.xlsx` in the frontend project for the full endpoint
list this backend is being built to cover.

### Quick start

```bash
npm install
cp .env.example .env          # fill in a real JWT_SECRET, e.g. `openssl rand -hex 32`
docker compose up -d          # starts a local Postgres matching .env.example
npm run prisma:generate       # generates the Prisma Client - see note below
npm run prisma:migrate        # creates the database schema
npm run start:dev
```

Don't have Docker? Point `DATABASE_URL` in `.env` at any Postgres 13+
instance instead (a free one from Neon/Supabase/Railway works fine) and
skip the `docker compose` step.

**`npm run prisma:generate` is not optional** - run it once before your
first build/start. Nothing in `src/` will type-check without it, since
`PrismaService` extends the generated `PrismaClient`. (This project was
originally scaffolded in a sandbox that couldn't reach Prisma's engine-
download host, so that step was verified separately - see "Verifying this
scaffold" below - rather than actually run there. It's one ordinary command
anywhere with normal internet access.)

`prisma/schema.prisma` is the source of truth for the schema. Its models
map 1:1 onto the original `missing-piece-marketplace/supabase/migrations/
0001_init_schema.sql` + `0003_admin.sql`, except `profiles` and Supabase's
`auth.users` are merged into one `User` model (`email` + `passwordHash`),
since Auth module (bcrypt + Passport/JWT) now owns credentials directly
instead of Supabase Auth. Row Level Security is gone too - ownership checks
(e.g. "only the seller can edit their own listing") move into the Nest
service layer instead of the database.

### What's implemented vs. stubbed

Cross-referenced against `../API_SPEC.md`'s 36 endpoints:

| Module | Status |
|---|---|
| **Auth** (signup/login/logout/me) | Implemented - bcrypt + Passport JWT |
| **Catalog** (categories, brands) | Implemented |
| **Profile** (me, update, my listings/need-requests) | Implemented |
| **Listings** (search, featured, match, detail, create, status, delete) | Implemented. `q` free-text search uses a plain case-insensitive `contains` rather than the original Postgres full-text (`tsvector`) index - see the comment in `listings.service.ts` for what to swap in before search volume gets large |
| **Need Requests** (create, match, status, delete) | Implemented |
| **Contact** (message a seller) | Implemented |
| **Admin** (overview, listings, need requests, users, categories, brands) | Implemented, guarded by `AdminGuard` (`isAdmin` on the JWT) |
| **Uploads** (`POST /uploads/listing-image`) | **Stub** - throws `NotImplementedException`. Needs an S3/R2 client wired in; see `uploads.service.ts` for the exact steps |

Ownership checks (a listing/need-request can only be edited or deleted by
whoever created it) are enforced in the service layer, replacing what
Postgres Row Level Security did in the Supabase version.

### Verifying this scaffold

Every module has real Jest tests in `src/**/*.spec.ts`. Run `npm test`.
Two suites (`auth.service.spec.ts`, `catalog.service.spec.ts` - representative
of the pattern used everywhere else) need the generated Prisma Client to
even compile, so they only run once you've done `npm run prisma:generate`
per the Quick start above. Everything else (DTO validation, the admin
guard, etc.) runs regardless.

The Prisma schema itself was verified by hand-applying its equivalent SQL
(`prisma/migrations/20260926000000_init/migration.sql`) to a real local
Postgres and round-tripping test data through it - confirming defaults,
and the cascade/restrict foreign-key rules, all behave as designed. See
`prisma/schema.prisma`'s header comment for details.

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
