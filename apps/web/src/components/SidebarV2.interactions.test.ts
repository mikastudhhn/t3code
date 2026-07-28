import { describe, expect, it } from "vite-plus/test";

import {
  handleSidebarV2SortableRowKeyDown,
  shouldDisableSidebarV2RowTooltip,
} from "./Sidebar.logic";

interface TestKeyboardEvent {
  key: string;
  target: object;
  currentTarget: object;
  defaultPrevented: boolean;
  preventDefault: () => void;
}

function keyboardEvent(key: string): TestKeyboardEvent {
  const row = {};
  const event: TestKeyboardEvent = {
    key,
    target: row,
    currentTarget: row,
    defaultPrevented: false,
    preventDefault: () => {
      event.defaultPrevented = true;
    },
  };
  return event;
}

describe("Sidebar V2 sortable row keyboard behavior", () => {
  it("reorders with Space, Arrow, Space without activating the chat", () => {
    let isDragging = false;
    let activations = 0;
    let moves = 0;
    const dispatch = (key: string) => {
      const event = keyboardEvent(key);
      handleSidebarV2SortableRowKeyDown({
        event,
        isDragging,
        onSortableKeyDown: (sortableEvent) => {
          if (sortableEvent.key === " ") {
            sortableEvent.preventDefault();
            isDragging = !isDragging;
          } else if (sortableEvent.key === "ArrowDown" && isDragging) {
            sortableEvent.preventDefault();
            moves++;
          }
        },
        onActivate: () => {
          activations++;
        },
      });
    };

    dispatch(" ");
    dispatch("ArrowDown");
    dispatch(" ");

    expect(moves).toBe(1);
    expect(activations).toBe(0);
    expect(isDragging).toBe(false);
  });

  it("lets one Escape cancel after an open row tooltip is disabled by dragging", () => {
    let tooltipOpen = true;
    let isDragging = true;
    let cancellations = 0;
    let activations = 0;

    if (shouldDisableSidebarV2RowTooltip(isDragging)) {
      tooltipOpen = false;
    }
    handleSidebarV2SortableRowKeyDown({
      event: keyboardEvent("Escape"),
      isDragging,
      onSortableKeyDown: (event) => {
        event.preventDefault();
        cancellations++;
        isDragging = false;
      },
      onActivate: () => {
        activations++;
      },
    });

    expect(tooltipOpen).toBe(false);
    expect(cancellations).toBe(1);
    expect(activations).toBe(0);
    expect(isDragging).toBe(false);
  });
});
