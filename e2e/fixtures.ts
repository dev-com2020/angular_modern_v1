import { test as base, expect, Page } from '@playwright/test';

/** Liczy żądania do fake backendu (każde loguje w konsoli "[fake-backend #N]"). */
export async function countBackendRequests(page: Page, action: () => Promise<void>): Promise<number> {
  let count = 0;
  const listener = (msg: { text(): string }) => {
    if (msg.text().includes('[fake-backend')) count++;
  };
  page.on('console', listener);
  await action();
  page.off('console', listener);
  return count;
}

export const test = base;
export { expect };

/** Testy tylko dla jednej z aplikacji (np. obsługa błędów, której legacy nie ma przed ćw. 7). */
export function onlyFor(projectName: 'legacy' | 'modern') {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== projectName, `Tylko dla projektu ${projectName}`);
  });
}
