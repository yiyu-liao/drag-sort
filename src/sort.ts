import { fromEvent } from "rxjs";
import { concatAll, map, takeUntil, tap } from "rxjs/operators";

interface IOption {
  wrapperId: string;
  itemHeight?: number;
  data: string[];
}

interface IElData {
  el: HTMLDivElement;
  sort: number;
  index: number;
}

export default class DragSort {
  itemHeight: number;
  wrapper: HTMLDivElement | null;
  data: string[];

  elArrs: IElData[] = [];
  activeIndex = 0;
  zIndex = 1;

  constructor(option: IOption) {
    this.itemHeight = option?.itemHeight || 40;

    this.wrapper = document.querySelector<HTMLDivElement>(
      `${option.wrapperId}`
    );

    this.data = option.data;

    this.initList();
  }

  initList() {
    let i = 0,
      l = this.data.length;
    let html = ``;
    while (i < l) {
      let labelText = this.data[i];
      html += `<div class="label" data-sort=${++i}>${labelText}</div>`;
    }
    this.wrapper?.innerHTML = html;

    let labels = document.querySelectorAll<HTMLDivElement>(".label");

    for (let i = 0; i < labels.length; i++) {
      this.elArrs[i] = {
        el: labels[i],
        sort: i,
        index: i
      };
      this.bindDragEvent(this.elArrs[i]);
    }
    this.computedSortPosition();
  }

  activeHighlight(event: TouchEvent | any) {
    const target = event.target as HTMLElement;
    target.style.zIndex = ++this.zIndex + "";
    target.style.transition = "all 0s";
    target.classList.add("highlight");
  }

  removeHighlight(event: TouchEvent | any) {
    const target = event.target as HTMLElement;
    target.style.zIndex = "0";
    target.classList.remove("highlight");
    target.style.transition = "all .5s";
  }

  bindDragEvent(elData: IElData) {
    const { el } = elData;
    const start$ = fromEvent(el, "touchstart");
    const move$ = fromEvent(document, "touchmove");
    const end$ = fromEvent(document, "touchend");

    start$
      .pipe(
        // @ts-ignore
        tap(this.activeHighlight),
        map((event: TouchEvent) => {
          event.preventDefault();
          let offsetTop = (event.target as HTMLElement).offsetTop;
          let startY = event.touches[0].pageY;
          return {
            offsetTop,
            startY
          };
        }),
        map(({ offsetTop, startY }) => {
          return move$.pipe(
            // @ts-ignore
            takeUntil(
              end$.pipe(
                tap((event: TouchEvent) => {
                  this.removeHighlight(event);
                  this.computedSortPosition();
                })
              )
            ),
            map((event: TouchEvent) => {
              let dragY = event.touches[0].pageY;
              return {
                top: this.getSafeNumber(dragY - startY + offsetTop)
              };
            })
          );
        }),
        concatAll()
      )
      .subscribe(({ top }) => {
        el.style.top = `${top}px`;
        this.sortList(elData, top);
      });
  }

  getSafeNumber(top: number): number {
    return Math.min(Math.max(0, top), this.itemHeight * (this.data.length - 1));
  }

  computedSortPosition() {
    for (let i = 0; i < this.elArrs.length; i++) {
      let current = this.elArrs[i];
      current.el.style.top = `${current.sort * this.itemHeight}px`;
    }
  }

  sortList(activeEl: IElData, y: number) {
    let newIndex = Math.round(y / this.itemHeight);

    // 控制移动范围
    newIndex = newIndex < 0 ? 0 : newIndex;
    newIndex =
      newIndex > this.elArrs.length - 1 ? this.elArrs.length - 1 : newIndex;

    if (newIndex === this.activeIndex) return;

    this.activeIndex = newIndex;
    let currentSort = activeEl.sort;

    for (let i = 0; i < this.elArrs.length; i++) {
      let item = this.elArrs[i];
      if (currentSort < newIndex) {
        if (item.sort > currentSort && item.sort <= newIndex) {
          item.sort -= 1;
        }
      } else if (currentSort > newIndex) {
        if (item.sort < currentSort && item.sort >= newIndex) {
          item.sort += 1;
        }
      }
      item.el.setAttribute("data-sort", item.sort + 1 + "");
    }

    this.elArrs[activeEl.index].sort = newIndex;
    this.elArrs[activeEl.index].el.setAttribute("data-sort", newIndex + 1 + "");

    this.computedSortPosition();
  }
}

new DragSort({
  wrapperId: "#wrapper",
  data: ["A", "B", "C", "D", "E"]
});
