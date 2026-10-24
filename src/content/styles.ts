export const CSS = `
:host{all:initial}
.gl{font:13px/1.4 system-ui,sans-serif;color:#1f2328;background:#fff;border:1px solid #d0d7de;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.15);padding:12px;width:330px;position:fixed;right:16px;bottom:16px;z-index:2147483647;max-height:70vh;overflow:auto}
.gl h2{font-size:14px;margin:0 0 8px;display:flex;justify-content:space-between;align-items:center}
.gl small{color:#57606a}.gl button,.gl select,.gl input{font:inherit;padding:3px 6px;border:1px solid #d0d7de;border-radius:6px;background:#f6f8fa}
.gl .row{display:flex;gap:6px;align-items:center;margin:6px 0;flex-wrap:wrap}.gl input{width:60px}
.gl table{border-collapse:collapse;width:100%}.gl td,.gl th{border-bottom:1px solid #eaeef2;padding:4px;text-align:left}
.gl .best{background:#dafbe1;font-weight:600}.gl dl{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;margin:0}.gl dt{color:#57606a}
.gl .tabs{display:flex;gap:4px;margin-bottom:6px}.gl .tabs .on{background:#1f883d;color:#fff;border-color:#1f883d}
.gl .grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 8px}.gl label.f{display:flex;justify-content:space-between;align-items:center;gap:4px;font-size:12px}.gl label.f input{width:64px}
.gl label.chk{display:inline-flex;gap:3px;align-items:center;font-size:12px;margin-right:6px}.gl label.block{display:flex;margin:6px 0}.gl label.chk input{width:auto}
.gl .kw{display:flex;flex-wrap:wrap;gap:4px}.gl .kw span{background:#ddf4ff;border-radius:4px;padding:1px 6px;font-size:12px}.gl .mini{width:auto;padding:6px 10px;cursor:pointer}
.gl .x{border:none;background:none;cursor:pointer;font-size:16px}`;
export const BADGE_CSS = `.giglens-card{margin:6px 0 2px;font:11px system-ui,sans-serif}.giglens-more summary{cursor:pointer;color:#0969da;font-size:11px;margin-top:3px}.giglens-more dl{display:grid;grid-template-columns:auto 1fr;gap:2px 8px;margin:4px 0;font-size:11px}.giglens-more dt{color:#57606a}.giglens-more dd{margin:0;color:#1f2328}.giglens-badges .o{background:#fff8c5;color:#7d4e00}.giglens-badges .on{background:#dafbe1;color:#116329}.giglens-badges{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0 2px;font:11px system-ui,sans-serif}.giglens-badges span{background:#eef6ff;color:#0a3069;border-radius:4px;padding:1px 5px}.giglens-badges .q{background:#dafbe1;color:#116329}.giglens-badges .f{background:#ffebe9;color:#a40e26}.giglens-badges .l{background:#f6f8fa;color:#8c959f}.giglens-tags span{background:#f6f8fa;color:#57606a}`;

export const BAR_CSS = `
:host{all:initial}
.bar{font:13px/1.4 system-ui,sans-serif;color:#1f2328;background:#fff;border:1px solid #1f883d;border-radius:8px;padding:8px 12px;display:flex;flex-direction:column;gap:6px}
.row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.sp{flex:1}.brand{color:#1f883d;margin-right:6px}
.lbl{color:#57606a;font-size:12px;margin-left:4px}
button,select,input{font:inherit;font-size:12px;padding:3px 8px;border:1px solid #d0d7de;border-radius:6px;background:#f6f8fa;color:#1f2328;cursor:pointer}
input{cursor:text;padding:3px 6px}button.on{background:#1f883d;border-color:#1f883d;color:#fff}button.ghost{background:#fff}
.chk{display:inline-flex;gap:3px;align-items:center;font-size:12px}.chk input{margin:0}
.count{font-size:12px;color:#57606a}.count b{color:#1f2328}
.kw .tag{background:#ddf4ff;color:#0a3069;border-radius:4px;padding:1px 6px;font-size:12px}.kw .tag b{font-weight:600}
.set{background:#f6f8fa;border-radius:6px;padding:6px}small{color:#57606a;font-size:11px}`;
