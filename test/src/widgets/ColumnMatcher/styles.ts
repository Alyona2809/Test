import styled from "styled-components";

export const Root = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 140px;
  min-height: 420px;
  touch-action: none;
  @media (max-width: 720px) {
    gap: 8px 40px;
  }
`;

export const Column = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Item = styled.li<{ $active?: boolean }>`
  background: #1b1f23;
  border: 2px solid ${(p) => (p.$active ? "var(--accent-2)" : "#2a2f34")};
  color: var(--text);
  border-radius: 12px;
  padding: 14px 16px;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
  position: relative;
`;

export const Handle = styled.button`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: none;
  background: var(--accent);
  cursor: grab;
  flex: none;
`;

export const Svg = styled.svg`
  position: absolute;
  inset: 0 0 0 0;
  pointer-events: none;
`;

export const CenterRow = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  pointer-events: none;
`;

export const CenterCell = styled.div`
  position: relative;
`;

export const RemoveBadge = styled.button`
  position: absolute;
  transform: translate(-50%, -50%);
  background: #243028;
  color: #c9f7d5;
  border: 1px solid #32523b;
  border-radius: 999px;
  padding: 0 0;
  width: 22px;
  height: 22px;
  font-size: 12px;
  cursor: pointer;
`;
