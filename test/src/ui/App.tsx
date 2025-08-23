import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import {
  ColumnMatcher,
  MatcherPair,
} from "../widgets/ColumnMatcher/ColumnMatcher";

const Global = createGlobalStyle`
	:root {
		--bg: #0b0c0d;
		--panel: #141618;
		--text: #e6e8ea;
		--muted: #9aa3ab;
		--accent: #137a2a;
		--accent-2: #17a34a;
	}
	* { box-sizing: border-box; }
	body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'; background: var(--bg); color: var(--text); }
`;

const Page = styled.div`
  min-height: 100svh;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const Card = styled.div`
  width: min(1100px, 100%);
  background: var(--panel);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
`;

const Toolbar = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const Button = styled.button`
  background: #1f2327;
  color: var(--text);
  border: 1px solid #2b3035;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
  &:hover {
    background: #23282d;
    border-color: #353b41;
  }
`;

const Title = styled.h2`
  margin: 0 0 12px;
`;

const defaultLeft = [
  "Свойство 1",
  "Свойство 2",
  "Свойство 3",
  "Свойство 4",
  "Свойство 5",
  "Свойство 6",
  "Свойство 7",
  "Свойство 8",
];
const defaultRight = [
  "Опция 1",
  "Опция 2",
  "Опция 3",
  "Опция 4",
  "Опция 5",
  "Опция 6",
  "Опция 7",
  "Опция 8",
];

const STORAGE_KEY = "column-matcher:v1";

export const App: React.FC = () => {
  const [pairs, setPairs] = React.useState<MatcherPair[]>([]);

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pairs));
  };
  const load = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setPairs(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  };
  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPairs([]);
  };

  return (
    <>
      <Global />
      <Page>
        <Card>
          <Title>Компонент сопоставления 2-х колонок</Title>
          <Toolbar>
            <Button onClick={clear}>Очистить</Button>
          </Toolbar>
          <ColumnMatcher
            leftItems={defaultLeft}
            rightItems={defaultRight}
            pairs={pairs}
            onChangePairs={setPairs}
          />
        </Card>
      </Page>
    </>
  );
};
