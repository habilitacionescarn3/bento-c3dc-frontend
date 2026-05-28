import { buildStripOrderPromotingBeside } from '../../../store/besideStripPromotion';

describe('besideStripPromotion', () => {
  describe('buildStripOrderPromotingBeside', () => {
    it('returns null for survivalAnalysis', () => {
      expect(buildStripOrderPromotingBeside(['race'], ['race'], 'survivalAnalysis')).toBeNull();
    });

    it('returns null without promoted dataset', () => {
      expect(buildStripOrderPromotingBeside(['race'], ['race'], null)).toBeNull();
    });

    it('promotes dataset to front of strip order', () => {
      const next = buildStripOrderPromotingBeside(
        ['sexAtBirth', 'race'],
        ['sexAtBirth', 'race'],
        'race',
      );
      expect(next[0]).toBe('race');
      expect(next).toContain('sexAtBirth');
    });

    it('appends missing visible datasets', () => {
      const next = buildStripOrderPromotingBeside(['race'], ['race', 'sexAtBirth'], 'sexAtBirth');
      expect(next).toContain('sexAtBirth');
      expect(next[0]).toBe('sexAtBirth');
    });
  });
});
