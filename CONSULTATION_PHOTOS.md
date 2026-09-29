# Consultation delivery

The consultation form uses a standard browser `POST` to
`https://formsubmit.co/flawlessink112@gmail.com`, with
`enctype="multipart/form-data"`. The browser navigates to the provider, which can
show its security check or activation instructions directly. This replaces the
cross-origin AJAX request whose network/JSON failures produced the generic
"We could not confirm delivery" message. There is no automatic retry.

After acceptance, FormSubmit's `_next` redirect returns the visitor to
`consultation-sent.html` on the same site. A per-submission identifier matches
the temporary draft in session storage; a bare visit to the confirmation page
does not claim that an email was sent. Service acceptance is not inbox delivery
or a confirmed appointment. Only the inbox owner can verify receipt.

The owner must activate the form using the FormSubmit email sent to
`flawlessink112@gmail.com`. CAPTCHA is enabled through the provider's default.
No provider secrets are stored in the website.

Required fields: name, email, phone, artist, placement, size, idea.
Optional: reference link and up to six photos, max 5 MiB per file and 10 MB total.
The `formdata` event adds the actual selected files as `attachment1` through
`attachment6`, including files selected in separate batches. Browsers without
`FormDataEvent` are asked to remove photos or use a current browser before
submitting, so attachments are never silently discarded.

Text details are saved only in this tab's session storage on submission and
discarded after acceptance. If the visitor goes Back after an error, the form
restores those details and enables Submit again. Photo objects survive browser
back/forward caching; after a full reload the visitor must select them again.
Private browsing that blocks storage does not block submission. No form data
is logged, included in the return URL, or stored in the repository.

Run `node --test tests/consultation.test.cjs` for the mocked submission and
confirmation regression tests. These do not send email. Live activation,
CAPTCHA completion, and inbox receipt still require an owner-run submission.
