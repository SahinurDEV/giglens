import { render, VNode } from 'preact';
import { CSS } from './styles';
export function mountPanel(node: VNode) {
  document.getElementById('giglens-root')?.remove();
  const host = document.createElement('div'); host.id = 'giglens-root';
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style'); style.textContent = CSS; shadow.appendChild(style);
  const box = document.createElement('div'); shadow.appendChild(box);
  document.body.appendChild(host); render(node, box);
}
