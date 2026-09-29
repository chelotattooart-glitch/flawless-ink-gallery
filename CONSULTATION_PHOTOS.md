# Gmail app consultation handoff

The primary button attempts Gmail compose on iOS using googlegmail:///co, Gmail-targeted Android mailto intent, and Gmail web on desktop. Gmail must be installed on mobile. App availability and successful opening cannot be detected by this page; there are no timed redirects or claims of delivery.

The visible fallback offers a standard mailto link for another email handler plus the full message and a copy button, with manual text selection if clipboard access fails. Client must tap Send. All entered fields are percent-encoded. Reference photos can be attached in the email app. Tests verify URL payloads and fallback behavior, not native Gmail on real phones. Verify on actual iPhone/Safari and Android before claiming device success.
