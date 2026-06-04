import { cohortAnalyzerThemeConfig } from '../../../styling/cohortAnalyzerThemeConfig';

describe('cohortAnalyzerThemeConfig', () => {
  it('extends base theme config', () => {
    expect(cohortAnalyzerThemeConfig.tblHeader).toBeDefined();
    expect(cohortAnalyzerThemeConfig.tblContainer).toBeDefined();
  });

  it('center-aligns table header cells', () => {
    const cell = cohortAnalyzerThemeConfig.tblHeader.MuiTableCell.root;
    expect(cell.textAlign).toBe('center');
    expect(cell.color).toBe('#0F253A');
  });

  it('styles first-column body cells the same as other columns', () => {
    const firstCol = cohortAnalyzerThemeConfig.tblBody.MuiTableCell.body['&:first-of-type'];
    expect(firstCol.color).toBe('#0F253A');
    expect(firstCol.fontWeight).toBe(400);
    expect(firstCol.textDecoration).toBe('none');
  });
});
