# Direct consultation delivery

The form submits to https://formsubmit.co/ajax/flawlessink112@gmail.com using multipart FormData. It stays on the site; no Gmail window opens. The owner must activate this form through the FormSubmit email sent to flawlessink112@gmail.com on the first submission. Until activation is verified, do not treat the integration as production-verified.

Required: name, email, phone, artist, placement, size, idea. Optional: reference link and up to six photos, max 5 MiB per file and 10 MB total. Photos are sent to FormSubmit as attachment1 through attachment6. Test a submission with photos and confirm receipt in the inbox after activation.

A success response indicates service acceptance, not confirmed inbox delivery. Failed/unconfirmed requests preserve the form. Do not auto-retry on timeouts. Honeypot and provider spam filtering are used; CAPTCHA is disabled for the AJAX flow. No service secrets are stored in client code.
