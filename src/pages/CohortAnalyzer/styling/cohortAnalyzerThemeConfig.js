import { themeConfig } from '../../studies/tableConfig/Theme';

/**
 * Cohort Analyzer table typography tokens. Header + body share Primary 4; first-column
 * (Participant ID) link styling uses TABLE_LINK_COLOR. Sizes are spec'd as font-size /
 * line-height / letter-spacing.
 */
const PRIMARY_4 = '#0F253A';
const TABLE_LINK_COLOR = '#004C73';

/**
 * Table + MUI overrides for Cohort Analyzer data grids (table view).
 */
export const cohortAnalyzerThemeConfig = {
    ...themeConfig,
    tblHeader: {
        ...themeConfig.tblHeader,
        MuiTableRow: {
            head: {
                height: '40px',
                borderTop: '3px solid #679AAA',
                borderBottom: '1px solid #000000',
            },
        },
        // Center all column headers; first column keeps link styling in body rows only.
        MuiTableCell: {
            ...(themeConfig.tblHeader && themeConfig.tblHeader.MuiTableCell),
            root: {
                ...(themeConfig.tblHeader
                    && themeConfig.tblHeader.MuiTableCell
                    && themeConfig.tblHeader.MuiTableCell.root),
                textAlign: 'center',
                padding: '0px 8px',
                // Column headers: Inter Bold, 17/17/0, Primary 4.
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: '17px',
                lineHeight: '17px',
                letterSpacing: '0',
                color: PRIMARY_4,
            },
        },
        // Sort label container — center in every column.
        // Inherit the cell's Inter Bold typography so the sortable header label matches the spec.
        MuiTableSortLabel: {
            ...(themeConfig.tblHeader && themeConfig.tblHeader.MuiTableSortLabel),
            root: {
                ...(themeConfig.tblHeader
                    && themeConfig.tblHeader.MuiTableSortLabel
                    && themeConfig.tblHeader.MuiTableSortLabel.root),
                justifyContent: 'center',
                width: '100%',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: '17px',
                lineHeight: '17px',
                letterSpacing: '0',
                color: `${PRIMARY_4} !important`,
            },
        },
    },
    tblBody: {
        ...themeConfig.tblBody,
        MuiTableCell: {
            ...themeConfig.tblBody.MuiTableCell,
            body: {
                ...themeConfig.tblBody.MuiTableCell.body,
                textAlign: 'center',
                paddingLeft: '8px',
                paddingRight: '8px',
                // Table text: Inter Regular, 16/17/0, Primary 4.
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '17px',
                letterSpacing: '0',
                color: PRIMARY_4,
                '&:first-of-type': {
                    // Participant ID column: Inter Semibold, 16/17/0, TABLE_LINK_COLOR.
                    color: TABLE_LINK_COLOR,
                    textDecoration: 'underline',
                    fontWeight: 600,
                },
            },
        },
    },
    // Background of the "no match" row shown by @bento-core/table's
    // DisplayErrMsg when the table has zero rows (e.g. before a cohort is selected).
    // The library forwards themeConfig.displayErr into the inner ThemeProvider.
    displayErr: {
        ...(themeConfig.displayErr || {}),
        MuiContainer: {
            ...(themeConfig.displayErr && themeConfig.displayErr.MuiContainer),
            root: {
                ...(themeConfig.displayErr
                    && themeConfig.displayErr.MuiContainer
                    && themeConfig.displayErr.MuiContainer.root),
                backgroundColor: '#F4F4F4',
            },
        },
    },
};
