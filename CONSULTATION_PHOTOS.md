# Gmail consultation handoff

Completing the consultation opens Gmail with the studio recipient
(`flawlessink112@gmail.com`), subject, and all consultation fields prefilled.
The visitor reviews the draft and clicks Send in Gmail. The site does not send
email itself and never claims inbox delivery or a confirmed appointment.

Gmail normally opens in a separate tab. If the browser blocks that opening,
the current tab navigates to Gmail instead. Form details are retained in the
original page, and an explicit Gmail link is also available after submission.

Reference links are included in the draft. Visitors attach photo files directly
in Gmail; the website no longer displays a misleading photo upload control.
There is no FormSubmit dependency, activation step, or provider CAPTCHA.
The previous temporary text draft is recovered if available and then removed
from session storage.

Run `node --test tests/consultation.test.cjs`. Tests mock window navigation and
verify validation, URL encoding, complete draft contents, and blocked-popup
fallback. They do not send emails or access a Gmail account.
