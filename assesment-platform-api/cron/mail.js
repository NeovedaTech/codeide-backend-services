// utils/mail.ts (or wherever you build email HTML)

// Minimal escaping (prevents HTML injection in name/url)
function escapeHtml(input) {
  return (input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function assessmentThankYouTemplate(name, previewUrl) {
  const safeName = escapeHtml(name || "there");
  const safePreviewUrl = escapeHtml(previewUrl);

  const accent = "#06b6d4";
  const bg = "#030617";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Knovia™️ - Assessment Preview</title>
</head>

<body style="margin:0;padding:0;background:${bg};background-color:${bg};">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Preview your assessment in one click.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="width:100%;background:${bg};background-color:${bg};
      background-image:radial-gradient(circle at top, rgba(6,182,212,0.20), transparent 55%);
      padding:32px 16px;">
    <tr>
      <td align="center" style="padding:0;margin:0;">

        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0"
          style="width:100%;max-width:640px;border-collapse:separate;">
          <tr>
            <td align="center"
              style="
                border-radius:28px;
                padding:40px 28px;
                background:#070b20;
                background-image:linear-gradient(180deg, rgba(7,11,32,0.98) 0%, rgba(2,4,13,0.96) 100%);
                border:1px solid rgba(255,255,255,0.10);
                box-shadow:0 28px 90px -55px rgba(6,182,212,0.60);
                text-align:center;
                font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
              ">

              <div style="margin-bottom:18px;">
                <span style="
                  display:inline-block;
                  padding:6px 14px;
                  border-radius:999px;
                  font-size:11px;
                  letter-spacing:0.28em;
                  font-weight:700;
                  text-transform:uppercase;
                  border:1px solid rgba(255,255,255,0.16);
                  background:rgba(255,255,255,0.08);
                  color:${accent};
                ">KNOVIA™️</span>
              </div>

              <h1 style="
                margin:0 0 14px;
                font-size:28px;
                line-height:1.2;
                color:#ffffff;
                font-weight:800;
              ">Thank you, ${safeName}!</h1>

              <p style="
                margin:0 0 14px;
                font-size:15px;
                line-height:1.75;
                color:rgba(226,232,240,0.92);
              ">
                Thank you for attempting the assessment. We really appreciate the time and effort you put in.
              </p>

              <p style="
                margin:0 0 22px;
                font-size:15px;
                line-height:1.75;
                color:rgba(226,232,240,0.92);
              ">
                You can preview your assessment using the button below:
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                <tr>
                  <td align="center"
                    style="
                      border-radius:999px;
                      background:#22d3ee;
                      background-image:linear-gradient(90deg, #22d3ee, #3b82f6);
                      box-shadow:0 10px 28px -18px rgba(34,211,238,0.85);
                    ">
                    <a href="${safePreviewUrl}" target="_blank" rel="noopener"
                      style="
                        display:inline-block;
                        padding:12px 26px;
                        border-radius:999px;
                        font-size:14px;
                        font-weight:800;
                        text-decoration:none;
                        color:#050a1f;
                        font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
                      ">
                      Preview Assessment
                    </a>
                  </td>
                </tr>
              </table>

              <p style="
                margin:22px 0 0;
                font-size:14px;
                line-height:1.75;
                color:rgba(148,163,184,0.92);
              ">
                If you have any questions, feel free to reach out to us.
              </p>

              <p style="
                margin:14px 0 0;
                font-size:13px;
                color:rgba(148,163,184,0.92);
              ">
                — Velocify Team
              </p>

              <div style="margin-top:22px;height:1px;background:rgba(255,255,255,0.08);"></div>

              <p style="
                margin:16px 0 0;
                font-size:12px;
                line-height:1.6;
                color:rgba(148,163,184,0.90);
              ">
                If the button doesn’t work, copy and paste this link into your browser:<br/>
                <a href="${safePreviewUrl}" target="_blank" rel="noopener"
                  style="color:${accent};text-decoration:none;word-break:break-all;">
                  ${safePreviewUrl}
                </a>
              </p>

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}