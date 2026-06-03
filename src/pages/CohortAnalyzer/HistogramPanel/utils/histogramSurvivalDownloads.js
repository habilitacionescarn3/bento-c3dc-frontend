import * as htmlToImage from 'html-to-image';
import { beginSurvivalRiskTableDownloadCapture } from './survivalRiskTableDownloadCapture';

/**
 * Capture Kaplan–Meier SVG as PNG download.
 */
export function downloadKaplanMeierChart(kmChartRef) {
  try {
    if (!kmChartRef.current) return;

    const svgElement = kmChartRef.current.querySelector('svg');
    if (!svgElement) return;

    const scaleFactor = 2;

    let width;
    let height;
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
      const [, , vw, vh] = viewBox.split(/\s+/).map(parseFloat);
      width = vw || svgElement.width.baseVal.value || svgElement.getBoundingClientRect().width;
      height = vh || svgElement.height.baseVal.value || svgElement.getBoundingClientRect().height;
    } else {
      width = svgElement.width.baseVal.value || svgElement.getBoundingClientRect().width;
      height = svgElement.height.baseVal.value || svgElement.getBoundingClientRect().height;
    }

    const clonedSvg = svgElement.cloneNode(true);
    clonedSvg.setAttribute('width', width);
    clonedSvg.setAttribute('height', height);
    clonedSvg.removeAttribute('style');

    const canvas = document.createElement('canvas');
    canvas.width = width * scaleFactor;
    canvas.height = height * scaleFactor;
    const ctx = canvas.getContext('2d');
    const TRANSPARENT_COLOR = '#00000000';

    ctx.fillStyle = TRANSPARENT_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scaleFactor, scaleFactor);

    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'kaplan_meier_chart.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      }, 'image/png');
    };

    img.src = url;
  } catch (error) {
    console.error('Error downloading Kaplan-Meier chart:', error);
  }
}

/**
 * Capture risk table DOM as PNG.
 */
export function downloadRiskTable(riskTableRef) {
  try {
    if (!riskTableRef || !riskTableRef.current) {
      console.error('Risk table ref not available');
      return;
    }

    const tableElement = riskTableRef.current;

    const originalMargin = tableElement.style.marginLeft;
    const originalBackgroundColor = tableElement.style.backgroundColor;
    tableElement.style.marginLeft = '0';
    tableElement.style.backgroundColor = 'transparent';

    const endDownloadCapture = beginSurvivalRiskTableDownloadCapture(tableElement);

    htmlToImage.toPng(tableElement, {
      backgroundColor: 'transparent',
      pixelRatio: 4,
      quality: 1.0,
    }).then((dataUrl) => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'risk_table.png';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
    }).catch((error) => {
      console.error('Error using html-to-image:', error);
      alert('Error downloading Risk table. Please check the console for details.');
    }).finally(() => {
      endDownloadCapture();
      tableElement.style.marginLeft = originalMargin;
      tableElement.style.backgroundColor = originalBackgroundColor;
    });
  } catch (error) {
    console.error('Error downloading Risk table:', error);
    alert('Error downloading Risk table. Please check the console for details.');
  }
}

/**
 * Combined survival section (KM + risk table) as one PNG.
 */
export function downloadSurvivalCombined(survivalAnalysisContainerRef, onCloseDropdown, riskTableRef) {
  try {
    if (typeof onCloseDropdown === 'function') onCloseDropdown();

    if (!survivalAnalysisContainerRef.current) {
      console.error('Survival analysis container ref not available');
      alert('Container not available for download.');
      return;
    }

    const containerElement = survivalAnalysisContainerRef.current;
    const riskTableElement = riskTableRef && riskTableRef.current ? riskTableRef.current : null;
    const endDownloadCapture = beginSurvivalRiskTableDownloadCapture(riskTableElement);

    htmlToImage.toPng(containerElement, {
      backgroundColor: 'transparent',
      pixelRatio: 2,
      quality: 1.0,
      useCORS: true,
      allowTaint: true,
    }).then((dataUrl) => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'survival_analysis_combined.png';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
    }).catch((error) => {
      console.error('Error downloading combined chart:', error);
      alert('Error downloading combined chart. Please check the console for details.');
    }).finally(() => {
      endDownloadCapture();
    });
  } catch (error) {
    console.error('Error downloading combined chart:', error);
    alert('Error downloading combined chart. Please check the console for details.');
  }
}
