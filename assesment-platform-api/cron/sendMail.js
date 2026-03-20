import { configDotenv } from "dotenv";
configDotenv();
import sgMail from "@sendgrid/mail";
import PDFDocument from "pdfkit";
// import { assessmentThankYouTemplate } from "./mail.js";
const key = process.env.SENDGRID_KEY;

sgMail.setApiKey(key);

export const generateCertificatePDF = (name, assessmentName, score, maxScore, solutionId) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ layout: "landscape", size: "A4", margin: 0 });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const W   = doc.page.width;   // ~841
    const H   = doc.page.height;  // ~595
    const mid = W / 2;

    // ── 1. Cream / off-white background ──────────────────────────────────────
    doc.rect(0, 0, W, H).fill("#fdfaf5");

    // Subtle warm watermark pattern — faint diagonal lines
    doc.lineWidth(0.3).strokeColor("#e8dfc8");
    for (let i = -H; i < W + H; i += 28) {
      doc.moveTo(i, 0).lineTo(i + H, H).stroke();
    }

    // ── 2. Formal border system ───────────────────────────────────────────────
    // Outer dark navy frame
    doc.rect(14, 14, W - 28, H - 28).lineWidth(4).stroke("#1e3a5f");
    // Gold inner line
    doc.rect(22, 22, W - 44, H - 44).lineWidth(1.5).stroke("#b8972a");
    // Thin inner rule
    doc.rect(28, 28, W - 56, H - 56).lineWidth(0.5).stroke("#b8972a");

    // ── 3. Corner ornaments ───────────────────────────────────────────────────
    const corners = [
      { x: 14, y: 14, dx: 1, dy: 1 },
      { x: W - 14, y: 14, dx: -1, dy: 1 },
      { x: 14, y: H - 14, dx: 1, dy: -1 },
      { x: W - 14, y: H - 14, dx: -1, dy: -1 },
    ];
    corners.forEach(({ x, y, dx, dy }) => {
      // Bold L corner bracket
      doc.moveTo(x, y + dy * 60).lineTo(x, y).lineTo(x + dx * 60, y)
         .lineWidth(4).strokeColor("#1e3a5f").stroke();
      // Inner gold L
      doc.moveTo(x + dx * 8, y + dy * 52).lineTo(x + dx * 8, y + dy * 8).lineTo(x + dx * 52, y + dy * 8)
         .lineWidth(1).strokeColor("#b8972a").stroke();
      // Corner diamond
      const cx = x + dx * 14, cy = y + dy * 14;
      doc.moveTo(cx, cy - 5).lineTo(cx + 5, cy).lineTo(cx, cy + 5).lineTo(cx - 5, cy)
         .closePath().fill("#b8972a");
    });

    // ── 4. Header block ───────────────────────────────────────────────────────
    // Navy top bar
    doc.rect(28, 28, W - 56, 62).fill("#1e3a5f");

    // Organisation name
    doc.fillColor("#f5e9c8").fontSize(22).font("Helvetica-Bold")
       .text("KNOVIA AI", 0, 38, { align: "center", characterSpacing: 8 });
    doc.fillColor("#b8972a").fontSize(8).font("Helvetica")
       .text("ADVANCED ASSESSMENT PLATFORM", 0, 66, { align: "center", characterSpacing: 4 });

    // ── 5. Certificate title ──────────────────────────────────────────────────
    doc.fillColor("#1e3a5f").fontSize(34).font("Helvetica-Bold")
       .text("CERTIFICATE OF ACHIEVEMENT", 0, 110, { align: "center", characterSpacing: 3 });

    // Gold rule under title
    doc.moveTo(mid - 240, 152).lineTo(mid + 240, 152).lineWidth(1.5).strokeColor("#b8972a").stroke();
    doc.moveTo(mid - 240, 156).lineTo(mid + 240, 156).lineWidth(0.4).strokeColor("#b8972a").stroke();

    // ── 6. Body copy ──────────────────────────────────────────────────────────
    doc.fillColor("#4a5568").fontSize(12).font("Helvetica")
       .text("This is to certify that", 0, 170, { align: "center" });

    // Recipient name — large, navy, with gold underline
    doc.fillColor("#1e3a5f").fontSize(36).font("Helvetica-Bold")
       .text(name, 0, 190, { align: "center" });

    const nameLineY = 234;
    doc.moveTo(mid - 180, nameLineY).lineTo(mid + 180, nameLineY)
       .lineWidth(1).strokeColor("#b8972a").stroke();

    doc.fillColor("#4a5568").fontSize(12).font("Helvetica")
       .text("has successfully demonstrated proficiency in", 0, 244, { align: "center" });

    // Assessment name — navy bold
    doc.fillColor("#1e3a5f").fontSize(18).font("Helvetica-Bold")
       .text(assessmentName, 60, 264, { width: W - 120, align: "center" });

    // Marks line
    const marksLabel = maxScore ? `${score} / ${maxScore}` : String(score);
    doc.fillColor("#4a5568").fontSize(11).font("Helvetica")
       .text(`with a score of  `, mid - 120, 295, { continued: true })
       .fillColor("#1e3a5f").font("Helvetica-Bold")
       .text(marksLabel, { continued: false });

    // ── 7. Divider before footer ──────────────────────────────────────────────
    const divY = 326;
    doc.moveTo(mid - 240, divY).lineTo(mid + 240, divY).lineWidth(0.4).strokeColor("#b8972a").stroke();
    doc.moveTo(mid - 240, divY + 4).lineTo(mid + 240, divY + 4).lineWidth(1.5).strokeColor("#1e3a5f").stroke();

    // ── 8. Signature block ────────────────────────────────────────────────────
    const sigY = 360;
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    // Left — date
    doc.moveTo(90, sigY + 34).lineTo(260, sigY + 34).lineWidth(0.8).strokeColor("#1e3a5f").stroke();
    doc.fillColor("#1e3a5f").fontSize(11).font("Helvetica-Bold")
       .text(dateStr, 90, sigY + 14, { width: 170, align: "center" });
    doc.fillColor("#718096").fontSize(8).font("Helvetica")
       .text("DATE OF ISSUE", 90, sigY + 40, { width: 170, align: "center", characterSpacing: 1 });

    // Right — authorized signatory
    doc.moveTo(W - 260, sigY + 34).lineTo(W - 90, sigY + 34).lineWidth(0.8).strokeColor("#1e3a5f").stroke();
    doc.fillColor("#1e3a5f").fontSize(11).font("Helvetica-Bold")
       .text("Knovia AI Team", W - 260, sigY + 14, { width: 170, align: "center" });
    doc.fillColor("#718096").fontSize(8).font("Helvetica")
       .text("AUTHORIZED SIGNATORY", W - 260, sigY + 40, { width: 170, align: "center", characterSpacing: 1 });

    // Center — Official seal
    const sealX = mid, sealY = sigY + 24;
    doc.circle(sealX, sealY, 38).fill("#1e3a5f");
    doc.circle(sealX, sealY, 38).lineWidth(2).stroke("#b8972a");
    doc.circle(sealX, sealY, 32).lineWidth(0.8).stroke("#b8972a");
    // 12-point star decoration
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      doc.circle(sealX + Math.cos(angle) * 36, sealY + Math.sin(angle) * 36, 1.5).fill("#b8972a");
    }
    doc.fillColor("#f5e9c8").fontSize(7).font("Helvetica-Bold")
       .text("CERTIFIED", sealX - 22, sealY - 8, { width: 44, align: "center", characterSpacing: 1 });
    doc.fillColor("#b8972a").fontSize(6).font("Helvetica")
       .text("KNOVIA AI", sealX - 18, sealY + 2, { width: 36, align: "center", characterSpacing: 1 });

    // ── 9. Footer ─────────────────────────────────────────────────────────────
    const certId = solutionId ? `KAI-${String(solutionId).toUpperCase()}` : `KAI-${Date.now().toString(36).toUpperCase()}`;
    doc.fillColor("#a09070").fontSize(7).font("Helvetica")
       .text(`Certificate ID: ${certId}  •  knovia.ai  •  ${new Date().getFullYear()}`,
             0, H - 36, { align: "center" });

    doc.end();
  });
};

export const sendAssessmentCertificateMail = async ({
  name,
  email,
  assessmentName,
  score,
  maxScore,
  solutionId,
}) => {
  const pdfBuffer = await generateCertificatePDF(name, assessmentName, score, maxScore, solutionId);
  
  const apiUrl      = process.env.API_URL      || "http://localhost:3000";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3030";
  const certLink    = `${apiUrl}/api/v1/assesments/certificate/${solutionId}`;
  const previewLink = `${frontendUrl}/assessment/preview/${solutionId}`;

  const msg = {
    to: email,
    from: {
      name: "Knovia AI",
      email: "noreply@velocify.in",
    },
    subject: `Your Knovia AI Certificate: ${assessmentName} 🎓`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Achievement Unlocked</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Certification — Knovia AI</p>
        </div>

        <div style="padding: 40px 30px; text-align: center;">
          <p style="font-size: 18px; margin-bottom: 8px;">Congratulations <strong>${name}</strong>!</p>
          <p style="color: #64748b; margin-bottom: 28px;">You have successfully completed the <strong>${assessmentName}</strong> assessment. Your performance has been verified and your certificate is ready.</p>

          <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
            <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Marks Obtained</p>
            <p style="margin: 6px 0 0 0; font-size: 28px; font-weight: bold; color: #2563eb;">${score}${maxScore ? ` / ${maxScore}` : ''}</p>
          </div>

          <div style="background: #fffbeb; border: 1px dashed #fbbf24; border-radius: 8px; padding: 14px; margin-bottom: 28px;">
            <p style="margin: 0; font-size: 11px; color: #92400e; text-transform: uppercase; letter-spacing: 1px;">Certificate ID</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: bold; color: #1e293b; font-family: monospace;">KAI-${solutionId}</p>
          </div>

          <!-- CTA Buttons -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
            <tr>
              <td style="padding: 0 6px 0 0;">
                <a href="${certLink}" target="_blank"
                   style="display: block; padding: 14px 0; background: #f59e0b; color: #1e293b; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; text-align: center;">
                  Download Certificate
                </a>
              </td>
              <td style="padding: 0 0 0 6px;">
                <a href="${previewLink}" target="_blank"
                   style="display: block; padding: 14px 0; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; text-align: center;">
                  View Full Report
                </a>
              </td>
            </tr>
          </table>

          <p style="font-size: 13px; color: #94a3b8;">Your official PDF certificate is also attached to this email.</p>
        </div>

        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Knovia AI &bull; Empowering Future Engineers</p>
        </div>
      </div>
    `,
    attachments: [
      {
        content: pdfBuffer.toString("base64"),
        filename: `${assessmentName.replace(/\s+/g, '_')}_Certificate.pdf`,
        type: "application/pdf",
        disposition: "attachment",
      },
    ],
  };

  await sgMail.send(msg);
};
