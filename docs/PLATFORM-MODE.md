# Platform mode (Phase 292)

One setting says how real the platform is: `PLATFORM_MODE` in Vercel. It is read from the environment only. There is no button for it in the admin panel, so it cannot be raised by accident, and changing it needs a redeploy.

| Mode | Meaning |
| --- | --- |
| `SANDBOX` | Test only. Nothing that pays real money may run. This is also the result when the variable is missing or misspelled. |
| `SOFT_LAUNCH` | A small, watched group of real users. |
| `LIVE` | Open to the public. |

The mode never switches a feature on by itself. It only allows a feature whose own switch is also on. Today the only feature that asks for it is paying distributions (Phase 290): it needs a mode other than `SANDBOX` and `DISTRIBUTIONS_ENABLED=1`.

The admin "Launch readiness" list shows the current mode. It is information only and does not block the launch.

## Not done yet

- The card sandbox (`CARD_SANDBOX_SECRET`), payments and refunds still have their own switches and do not read the mode.
- No banner tells users the platform is in test mode.

Do not set `SOFT_LAUNCH` or `LIVE` before counsel has answered the questions in docs/DISTRIBUTIONS.md and docs/CONTRACT-FRAMEWORK.md.
