import { DegreeClassification, GradingScale } from '../../types/cgpa';

interface ResultCardData {
  studentName?: string;
  university?: string;
  department?: string;
  cgpa: number;
  gradingScale: GradingScale;
  totalUnits: number;
  totalPoints: number;
  semestersCount: number;
  classification: DegreeClassification;
}

/**
 * Renders a high-resolution 1080x1350 result card onto a Canvas element
 */
export async function generateResultCardCanvas(data: ResultCardData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // 1. Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
  if (data.cgpa >= 4.5 && data.gradingScale === '5.0') {
    bgGrad.addColorStop(0, '#1E1500');
    bgGrad.addColorStop(0.3, '#2D1E04');
    bgGrad.addColorStop(0.7, '#150E01');
    bgGrad.addColorStop(1, '#0A0700');
  } else if (data.cgpa >= 3.5 && data.gradingScale === '5.0') {
    bgGrad.addColorStop(0, '#042217');
    bgGrad.addColorStop(0.3, '#063826');
    bgGrad.addColorStop(0.7, '#042217');
    bgGrad.addColorStop(1, '#02120C');
  } else if (data.cgpa >= 2.4 && data.gradingScale === '5.0') {
    bgGrad.addColorStop(0, '#0B1E38');
    bgGrad.addColorStop(0.3, '#102A4E');
    bgGrad.addColorStop(0.7, '#0B1E38');
    bgGrad.addColorStop(1, '#050D19');
  } else {
    bgGrad.addColorStop(0, '#1E1512');
    bgGrad.addColorStop(0.3, '#2D1E19');
    bgGrad.addColorStop(0.7, '#1A120F');
    bgGrad.addColorStop(1, '#0D0907');
  }

  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1350);

  // Subtle decorative geometric background circles
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(540, 680, 480, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(540, 680, 360, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 2. Outer Card Frame
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 4;
  roundRect(ctx, 40, 40, 1000, 1270, 40);
  ctx.stroke();
  ctx.restore();

  // 3. Top Header Bar
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '4px';
  ctx.fillText('🎓 NIGERIAN UNIVERSITY CGPA REPORT', 540, 120);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '600 22px sans-serif';
  ctx.letterSpacing = '1px';
  const schoolText = data.university || 'Federal / State University of Nigeria';
  ctx.fillText(schoolText.toUpperCase(), 540, 160);

  if (data.department) {
    ctx.fillStyle = '#10B981';
    ctx.font = '700 20px sans-serif';
    ctx.fillText(`DEPARTMENT OF ${data.department.toUpperCase()}`, 540, 195);
  }

  // 4. Student Name Banner (if provided)
  if (data.studentName && data.studentName.trim()) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 28px sans-serif';
    ctx.fillText(data.studentName.toUpperCase(), 540, 245);
  }

  // 5. Hero Central CGPA Circle / Speedometer Visual
  const centerY = 520;
  const radius = 210;

  // Outer glow ring
  const ringGrad = ctx.createLinearGradient(330, centerY - radius, 750, centerY + radius);
  ringGrad.addColorStop(0, data.classification.hexColor);
  ringGrad.addColorStop(0.5, '#F59E0B');
  ringGrad.addColorStop(1, data.classification.hexColor);

  ctx.save();
  ctx.strokeStyle = ringGrad;
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.arc(540, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Circle background fill
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.arc(540, centerY, radius - 10, 0, Math.PI * 2);
  ctx.fill();

  // "MY CGPA" Subtitle inside circle
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '900 26px sans-serif';
  ctx.letterSpacing = '5px';
  ctx.fillText('MY CGPA', 540, centerY - 80);

  // Big Hero Number: "4.35"
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 130px sans-serif';
  ctx.letterSpacing = '-2px';
  ctx.fillText(data.cgpa.toFixed(2), 540, centerY + 45);

  // Scale tag inside circle: "/ 5.00 SCALE"
  ctx.fillStyle = data.classification.hexColor;
  ctx.font = '800 24px sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText(`OUT OF ${data.gradingScale === '5.0' ? '5.00' : '4.00'} SCALE`, 540, centerY + 105);

  // 6. Degree Classification Ribbon Box
  const ribbonY = 780;
  const ribbonGrad = ctx.createLinearGradient(120, ribbonY, 960, ribbonY);
  ribbonGrad.addColorStop(0, data.classification.hexColor);
  ribbonGrad.addColorStop(1, '#D97706');

  ctx.fillStyle = ribbonGrad;
  roundRect(ctx, 100, ribbonY, 880, 110, 30);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 38px sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText(data.classification.classTitle.toUpperCase(), 540, ribbonY + 54);

  ctx.font = '700 22px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText(data.classification.motivationalQuote, 540, ribbonY + 88);

  // 7. Academic Summary Stats Bar (3 Metric Boxes)
  const statsY = 930;
  const boxW = 270;
  const boxH = 120;
  const gap = 35;
  const startX = (1080 - (boxW * 3 + gap * 2)) / 2;

  const statItems = [
    { label: 'TOTAL UNITS', val: `${data.totalUnits} UNITS` },
    { label: 'TOTAL POINTS', val: `${data.totalPoints} PTS` },
    { label: 'SEMESTERS', val: `${data.semestersCount} SEMESTER${data.semestersCount > 1 ? 'S' : ''}` },
  ];

  statItems.forEach((st, idx) => {
    const x = startX + idx * (boxW + gap);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    roundRect(ctx, x, statsY, boxW, boxH, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '700 17px sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText(st.label, x + boxW / 2, statsY + 45);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 28px sans-serif';
    ctx.letterSpacing = '0px';
    ctx.fillText(st.val, x + boxW / 2, statsY + 88);
  });

  // 8. Bottom Brand & Slogan
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = '800 24px sans-serif';
  ctx.fillText('Calculated with NaijaHub • 100% Accurate & Free', 540, 1120);

  // Green web pill
  ctx.fillStyle = '#087443';
  roundRect(ctx, 220, 1160, 640, 70, 35);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 24px sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('📲 naijahub.vercel.app/cgpa-calculator', 540, 1204);

  return canvas;
}

/**
 * Generate Data URL
 */
export async function generateResultCardDataUrl(data: ResultCardData): Promise<string> {
  const canvas = await generateResultCardCanvas(data);
  return canvas.toDataURL('image/png', 0.95);
}

/**
 * Helper to download result card
 */
export async function downloadResultCard(data: ResultCardData, filename = 'My_CGPA_Result_Card.png') {
  const dataUrl = await generateResultCardDataUrl(data);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Share result via Web Share API or WhatsApp
 */
export async function shareResultCard(data: ResultCardData): Promise<boolean> {
  const canvas = await generateResultCardCanvas(data);

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }

      const file = new File([blob], 'My_CGPA_NaijaHub.png', { type: 'image/png' });
      const shareText = `🎓 MY CGPA: ${data.cgpa.toFixed(2)} (${data.classification.classTitle})! Calculated on NaijaHub. Check yours free here: https://naijahub.vercel.app/cgpa-calculator`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'My CGPA Result Card',
            text: shareText,
            files: [file],
          });
          resolve(true);
          return;
        } catch {
          // Fall back to text share
        }
      }

      // WhatsApp fallback URL
      const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
      resolve(true);
    }, 'image/png');
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
