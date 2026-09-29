# Direct consultation form

The form sends JSON to FormSubmit's AJAX endpoint for flawlessink112@gmail.com.
Clients stay on the page and do not need Gmail. FormSubmit processes the submitted
contact details and tattoo request; the form discloses this before sending.

Owner setup: submit one clearly labeled test from the published website, then
open the activation email in flawlessink112@gmail.com and confirm the form.
Check spam if needed. Submit another test and verify actual inbox receipt.
Do not treat publication or an API acknowledgement as verified email delivery.

Requests retain their entered details on failure and time out after 25 seconds.
Repeat clicks are blocked while sending and after acceptance, until a field changes.
Confirmation does not promise a booked appointment or verified inbox delivery.
Reference links are supported; file attachments are not currently offered.
Call, SMS, and direct email remain available below the form.

Run node --test tests/consultation.test.cjs for mocked submission tests.
