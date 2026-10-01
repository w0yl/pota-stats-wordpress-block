(function (wp) {
  const registerBlockType = wp.blocks.registerBlockType;
  const el = wp.element.createElement;
  const useState = wp.element.useState;
  const InspectorControls = wp.blockEditor ? wp.blockEditor.InspectorControls : wp.editor.InspectorControls;
  const useBlockProps = wp.blockEditor ? wp.blockEditor.useBlockProps : function () { return {}; };
  const PanelBody = wp.components.PanelBody;
  const TextControl = wp.components.TextControl;
  const Button = wp.components.Button;
  const RangeControl = wp.components.RangeControl;

  // Safe fallback for local logo URL
  const logoUrl = (typeof window.potaBlockData !== 'undefined' && window.potaBlockData.logoUrl)
    ? window.potaBlockData.logoUrl
    : 'https://pota.app/pota-logo.png';

  registerBlockType('pota-stats/stats-block', {
    title: 'POTA Stats',
    icon: 'chart-bar',
    category: 'widgets',
    attributes: {
      callsigns: {
        type: 'array',
        default: [],
      },
      cacheDuration: {
        type: 'number',
        default: 1,
      },
    },

    edit: function (props) {
      const attributes = props.attributes;
      const setAttributes = props.setAttributes;
      const [newCallsign, setNewCallsign] = useState('');

      const blockProps = useBlockProps();

      const addCallsign = function () {
        const formatted = newCallsign.trim().toUpperCase();
        if (formatted && !attributes.callsigns.includes(formatted)) {
          setAttributes({ callsigns: [...attributes.callsigns, formatted] });
          setNewCallsign('');
        }
      };

      const removeCallsign = function (callToRemove) {
        const updated = attributes.callsigns.filter(function (c) { return c !== callToRemove; });
        setAttributes({ callsigns: updated });
      };

      const callsignCount = attributes.callsigns.length;

      return el(
        'div',
        blockProps,
        el(
          InspectorControls,
          null,
          el(
            PanelBody,
            { title: 'POTA Configuration' },
            el(
              'div',
              { style: { marginBottom: '15px' } },
              el('label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Managed Callsigns'),
              el(
                'div',
                { style: { display: 'flex', gap: '5px', marginBottom: '10px' } },
                el(TextControl, {
                  value: newCallsign,
                  onChange: function (val) { setNewCallsign(val); },
                  placeholder: 'e.g. AE0S',
                }),
                el(Button, { isPrimary: true, onClick: addCallsign }, 'Add')
              ),
              el(
                'ul',
                { style: { paddingLeft: 0, listStyle: 'none' } },
                attributes.callsigns.map(function (call) {
                  return el(
                    'li',
                    {
                      key: call,
                      style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '4px 8px',
                        background: '#f0f0f0',
                        marginBottom: '4px',
                        borderRadius: '4px',
                      },
                    },
                    el('strong', null, call),
                    el(Button, { isDestructive: true, isSmall: true, onClick: function () { removeCallsign(call); } }, '×')
                  );
                })
              )
            ),
            el(RangeControl, {
              label: 'Cache Duration (Hours)',
              value: attributes.cacheDuration,
              onChange: function (val) { setAttributes({ cacheDuration: val }); },
              min: 1,
              max: 72,
            })
          )
        ),
        el(
          'div',
          { className: 'pota-dashboard-block pota-editor-preview' },
          el(
            'div',
            { className: 'pota-header' },
            el(
              'div',
              { className: 'pota-header-text' },
              el('h2', null, 'POTA Statistics'),
              el('span', { className: 'pota-header-sub' }, 'Parks on the Air Operator Summary')
            ),
            el(
              'div',
              { className: 'pota-header-logo' },
              el('img', { src: logoUrl, alt: 'POTA Logo' })
            )
          ),
          el(
            'div',
            { className: 'pota-table-wrapper', style: { marginTop: '15px' } },
            el(
              'table',
              { className: 'pota-table' },
              el(
                'thead',
                null,
                el(
                  'tr',
                  null,
                  el('th', null, 'Callsign'),
                  el('th', null, 'Activations'),
                  el('th', null, 'Parks Activated'),
                  el('th', null, 'Hunted Parks'),
                  el('th', null, 'Total QSOs'),
                  el('th', null, 'Awards')
                )
              ),
              el(
                'tbody',
                null,
                attributes.callsigns.map(function (call) {
                  return el(
                    'tr',
                    { key: call },
                    el('td', null, el('span', { className: 'pota-badge-callsign' }, call)),
                    el('td', null, el('span', { className: 'pota-badge pota-badge-act' }, '—')),
                    el('td', null, '—'),
                    el('td', null, el('span', { className: 'pota-badge pota-badge-hunt' }, '—')),
                    el('td', null, '—'),
                    el('td', null, '—')
                  );
                })
              ),
              el(
                'tfoot',
                null,
                el(
                  'tr',
                  { className: 'pota-total-row' },
                  el('td', null, el('strong', null, 'Total (' + callsignCount + ')')),
                  el('td', null, el('strong', null, '—')),
                  el('td', null, el('strong', null, '—')),
                  el('td', null, el('strong', null, '—')),
                  el('td', null, el('strong', null, '—')),
                  el('td', null, el('strong', null, '—'))
                )
              )
            )
          )
        )
      );
    },

    save: function () {
      return null;
    },
  });
})(window.wp);