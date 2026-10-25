export const CSS = `
:host{all:initial}
.gl{font:13px/1.45 Inter,system-ui,-apple-system,sans-serif;color:#222325;background:#fff;border:1px solid #e4e5e7;border-radius:12px;box-shadow:0 8px 28px rgba(15,23,42,.12);padding:14px;width:330px;position:fixed;right:16px;bottom:16px;z-index:2147483647;max-height:70vh;overflow:auto}
.gl h2{font-size:14px;margin:0 0 10px;display:flex;justify-content:space-between;align-items:center;font-weight:700}
.gl small{color:#74767e}.gl button,.gl select,.gl input{font:inherit;padding:5px 9px;border:1px solid #e4e5e7;border-radius:8px;background:#fafafa;color:#222325}
.gl .row{display:flex;gap:6px;align-items:center;margin:6px 0;flex-wrap:wrap}.gl input{width:60px}
.gl table{border-collapse:collapse;width:100%}.gl td,.gl th{border-bottom:1px solid #efeff0;padding:6px 4px;text-align:left}
.gl .best{background:#e8faf0;font-weight:600;color:#0e9f6e}.gl dl{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;margin:0}.gl dt{color:#74767e}
.gl .tabs{display:flex;gap:4px;margin-bottom:6px}.gl .tabs .on{background:#1dbf73;color:#fff;border-color:#1dbf73}
.gl .grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 8px}.gl label.f{display:flex;justify-content:space-between;align-items:center;gap:4px;font-size:12px}.gl label.f input{width:64px}
.gl label.chk{display:inline-flex;gap:3px;align-items:center;font-size:12px;margin-right:6px}.gl label.block{display:flex;margin:6px 0}.gl label.chk input{width:auto}
.gl .kw{display:flex;flex-wrap:wrap;gap:4px}.gl .kw span{background:#e8faf0;border-radius:999px;padding:2px 8px;font-size:12px;color:#0e9f6e}.gl .mini{width:auto;padding:8px 12px;cursor:pointer;background:#1dbf73;color:#fff;border:none;border-radius:8px;font-weight:600}
.gl.wide{width:460px}.gl .tools{margin:8px 0;border-top:1px solid #efeff0;padding-top:8px}.gl .tools button.on{background:#1dbf73;color:#fff;border-color:#1dbf73}.gl .tag{border-radius:999px;padding:1px 7px;margin:1px;display:inline-block;font-size:11px}.gl .tag.ok{background:#e8faf0;color:#0e9f6e}.gl .tag.miss{background:#fff6e6;color:#b76e00}.gl .ra summary{cursor:pointer;font-weight:600}.gl .bar-m{display:inline-flex;flex-direction:column;align-items:center;font-size:10px;margin-right:6px;vertical-align:bottom}.gl .bar-m i{display:block;width:12px;background:#1dbf73;border-radius:2px}.gl .feat td{font-size:11px;color:#74767e}.gl dl.kv{margin-top:8px;font-size:12px}
.gl .x{border:none;background:none;cursor:pointer;font-size:18px;color:#74767e;line-height:1}`;

export const BADGE_CSS = `
.giglens-card{margin:8px 0 4px;padding:10px 12px;border:1px solid #e4e5e7;border-radius:10px;background:#fff;box-shadow:0 1px 2px rgba(15,23,42,.04);font:12px/1.4 Inter,system-ui,-apple-system,sans-serif;color:#222325}
.giglens-badges{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.giglens-badges span{display:inline-flex;align-items:center;gap:3px;background:#f5f5f5;color:#404145;border-radius:999px;padding:3px 8px;font-size:11px;font-weight:500;border:1px solid transparent}
.giglens-badges .q{background:#e8faf0;color:#0e9f6e;border-color:#c6f0db}
.giglens-badges .f{background:#fff0f3;color:#c81e4a;border-color:#ffd0dc}
.giglens-badges .o{background:#fff6e6;color:#b76e00;border-color:#ffe2a8}
.giglens-badges .on{background:#e8faf0;color:#0e9f6e}
.giglens-badges .deal{font-weight:700}.giglens-badges .deal.high{background:#e8faf0;color:#0e9f6e;border-color:#1dbf73}
.giglens-badges .deal.mid{background:#eef2ff;color:#3730a3;border-color:#c7d2fe}
.giglens-badges .deal.low{background:#f5f5f5;color:#74767e}
.giglens-badges .sub{background:#f3e8ff;color:#6b21a8}.giglens-badges .vac{background:#fff1e5;color:#953800}
.giglens-badges .l{background:#f5f5f5;color:#95979d}
.giglens-tags span{background:#fafafa;color:#74767e;border:1px solid #e4e5e7}
.giglens-more{margin-top:6px}.giglens-more summary{cursor:pointer;color:#1dbf73;font-size:12px;font-weight:600;list-style:none}
.giglens-more summary::-webkit-details-marker{display:none}
.giglens-more dl{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;margin:8px 0 0;font-size:11px;padding-top:8px;border-top:1px solid #efeff0}
.giglens-more dt{color:#74767e}.giglens-more dd{margin:0;color:#222325}
.giglens-actions{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
.giglens-actions button{font:11px/1.2 Inter,system-ui,sans-serif;padding:5px 10px;border:1px solid #e4e5e7;border-radius:8px;background:#fafafa;cursor:pointer;color:#404145;font-weight:600}
.giglens-actions button:hover{border-color:#c7c7c7;background:#fff}
.giglens-actions button.on{background:#1dbf73;color:#fff;border-color:#1dbf73}`;

export const BAR_CSS = `
:host{all:initial}
.bar{font:13px/1.4 Inter,system-ui,-apple-system,sans-serif;color:#222325;background:#fff;border:1px solid #e4e5e7;border-radius:12px;padding:10px 14px;display:flex;flex-direction:column;gap:8px;box-shadow:0 1px 3px rgba(15,23,42,.06)}
.row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.head{gap:8px}.sp{flex:1;min-width:8px}
.brand{color:#1dbf73;font-weight:800;letter-spacing:-.02em;margin-right:4px;font-size:14px}
.lbl{color:#74767e;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.02em;margin-left:2px}
button,select,input{font:inherit;font-size:12px;padding:5px 10px;border:1px solid #e4e5e7;border-radius:8px;background:#fafafa;color:#222325;cursor:pointer;transition:border-color .12s,background .12s}
button:hover,select:hover{border-color:#c7c7c7;background:#fff}
input{cursor:text;padding:5px 8px;background:#fff}
button.on{background:#1dbf73;border-color:#1dbf73;color:#fff;font-weight:600}
button.on:hover{background:#19a463;border-color:#19a463}
button.ghost{background:#fff}
button.primary{background:#1dbf73;border-color:#1dbf73;color:#fff;font-weight:700}
button.primary:hover{background:#19a463}
button.icon{padding:5px 8px;min-width:32px}
.chk{display:inline-flex;gap:4px;align-items:center;font-size:12px;color:#404145;padding:3px 6px;border-radius:8px;background:#fafafa;border:1px solid #efeff0}
.chk input{margin:0;accent-color:#1dbf73}
.count{font-size:12px;color:#74767e}.count b{color:#222325;font-weight:700}
.kw{align-items:flex-start}.kw .chips{display:flex;flex-wrap:wrap;gap:5px;flex:1}
.kw .tag{background:#f0fdf6;color:#0e9f6e;border:1px solid #c6f0db;border-radius:999px;padding:2px 8px;font-size:11px;font-weight:500}
.kw .tag b{font-weight:700;margin-left:2px}
.set{background:#fafafa;border:1px solid #efeff0;border-radius:10px;padding:8px 10px}
.ins{font-size:12px;gap:10px;color:#404145;padding:6px 0 2px;border-top:1px solid #efeff0}
.ins b{font-weight:700;color:#222325}
.full{flex-basis:100%}
.helper{display:flex;flex-direction:column;gap:6px;border-top:1px solid #efeff0;padding-top:8px}
.tag{background:#f0fdf6;color:#0e9f6e;border-radius:999px;padding:2px 8px;font-size:11px}
.tag.ok{background:#e8faf0;color:#0e9f6e}.tag.miss{background:#fff6e6;color:#b76e00}
.niche{padding:0 6px;border-radius:999px}.niche.high{background:#e8faf0;color:#0e9f6e}.niche.medium{background:#fff6e6;color:#b76e00}.niche.low{background:#fff0f3;color:#c81e4a}
.overlay{position:fixed;inset:0;background:rgba(15,23,42,.35);z-index:2147483647;display:flex;align-items:flex-start;justify-content:center;padding-top:60px;backdrop-filter:blur(2px)}
.modal{background:#fff;color:#222325;border-radius:14px;padding:16px;max-width:min(1100px,95vw);max-height:80vh;overflow:auto;box-shadow:0 16px 48px rgba(15,23,42,.22);font:13px Inter,system-ui,sans-serif;border:1px solid #e4e5e7}
.cmp{border-collapse:collapse;width:100%;margin-top:8px}.cmp td,.cmp th{border-bottom:1px solid #efeff0;padding:6px 8px;text-align:left;vertical-align:top;font-size:12px}.cmp th{min-width:160px}.cmp .k{color:#74767e;white-space:nowrap}.cmp a{color:#1dbf73}
.muted{color:#74767e;font-weight:400;font-size:11px}
.collapsed-hint{font-size:12px;color:#74767e}
small{color:#74767e;font-size:11px}`;
