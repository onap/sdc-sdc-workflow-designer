// previous version:
// https://github.com/angular-ui/bootstrap/blob/07c31d0731f7cb068a1932b8e01d2312b796b4ec/src/position/position.js
export class Positioning {
    private getStyle(element: HTMLElement, prop: string): string {
        return window.getComputedStyle(element)[prop];
    }

    private isStaticPositioned(element: HTMLElement): boolean {
        return (this.getStyle(element, 'position') || 'static') === 'static';
    }

    private offsetParent(element: HTMLElement): HTMLElement {
        let offsetParentEl = <HTMLElement>element.offsetParent || document.documentElement;

        while (offsetParentEl && offsetParentEl !== document.documentElement && this.isStaticPositioned(offsetParentEl)) {
            offsetParentEl = <HTMLElement>offsetParentEl.offsetParent;
        }

        return offsetParentEl || document.documentElement;
    }

   public position(element: HTMLElement, round = true): ClientRect {
        let elPosition: ClientRect;
        let parentOffset: ClientRect = {width: 0, height: 0, top: 0, bottom: 0, left: 0, right: 0};

        if (this.getStyle(element, 'position') === 'fixed') {
            elPosition = element.getBoundingClientRect();
        } else {
            const offsetParentEl = this.offsetParent(element);

            elPosition = this.offset(element, false);

            if (offsetParentEl !== document.documentElement) {
                parentOffset = this.offset(offsetParentEl, false);
            }

            parentOffset.top += offsetParentEl.clientTop;
            parentOffset.left += offsetParentEl.clientLeft;
        }

        elPosition.top -= parentOffset.top;
        elPosition.bottom -= parentOffset.top;
        elPosition.left -= parentOffset.left;
        elPosition.right -= parentOffset.left;

        if (round) {
            elPosition.top = Math.round(elPosition.top);
            elPosition.bottom = Math.round(elPosition.bottom);
            elPosition.left = Math.round(elPosition.left);
            elPosition.right = Math.round(elPosition.right);
        }

        return elPosition;
    }

    public offset(element: HTMLElement, round = true): ClientRect {
        const elBcr = element.getBoundingClientRect();
        const viewportOffset = {
            top: window.pageYOffset - document.documentElement.clientTop,
            left: window.pageXOffset - document.documentElement.clientLeft
        };

        let elOffset = {
            height: elBcr.height || element.offsetHeight,
            width: elBcr.width || element.offsetWidth,
            top: elBcr.top + viewportOffset.top,
            bottom: elBcr.bottom + viewportOffset.top,
            left: elBcr.left + viewportOffset.left,
            right: elBcr.right + viewportOffset.left
        };

        if (round) {
            elOffset.height = Math.round(elOffset.height);
            elOffset.width = Math.round(elOffset.width);
            elOffset.top = Math.round(elOffset.top);
            elOffset.bottom = Math.round(elOffset.bottom);
            elOffset.left = Math.round(elOffset.left);
            elOffset.right = Math.round(elOffset.right);
        }

        return elOffset;
    }


    public getPlacementPrimary(hostElement: HTMLElement, targetElement: HTMLElement, placement: string): string {

        // let placementPrimaryArray = ['right', 'bottom', 'left', 'top'];
        // placementPrimaryArray.splice(placementPrimaryArray.indexOf(placementPrimary), 1);
        // placementPrimaryArray.splice(0, 0, placementPrimary);

        let placementPrimaryArray = this.getTotalPlacementArr(placement);
        let placementPrimary;
        let placementSecondary;
        let rect;

        let result = placementPrimaryArray.find(place => {
            placementPrimary = place.split('-')[0] || 'top';
            placementSecondary = place.split('-')[1] || 'center';
            rect = this.getBoundingClientRect(placementPrimary, placementSecondary, hostElement, targetElement);
            return this.canDisplay(rect);
        });

        if (!result) {
            return placement;
        } else {
            return result;
        }
    }

    private getTotalPlacementArr(placement: string): any {
        let placementPrimary = placement.split('-')[0] || 'top';

        let placementBasic = ['right', 'bottom', 'left', 'top'];
        placementBasic.splice(placementBasic.indexOf(placementPrimary), 1);
        placementBasic.splice(0, 0, placementPrimary);
        let placeTotal = {
            right: [
                'right',
                'right-top',
                'right-bottom'
            ],
            bottom: [
                'bottom',
                'bottom-left',
                'bottom-right'
            ],
            left: [
                'left',
                'left-top',
                'left-bottom'
            ],
            top: [
                'top',
                'top-left',
                'top-right'
            ]
        }
        let placeArr = [];
        placeArr.push(placement);
        placementBasic.forEach(placePri => {
            placeTotal[placePri].forEach(palce => {
                if (placement !== palce) {
                    placeArr.push(palce);
                }
            });
        });
        return placeArr;
    }

	private canDisplay(rect): boolean {
		if(this.isSheltered(rect, window)) {
			return false;
		} else {
			var pElement = this.getParentElement(window);
			if(pElement) {
				const shelter = this.getShelter(pElement, window.parent, rect);
				if(shelter) {
					return false;
				} else {
					return true;
				}
			} else {
				return true;
			}

		}
	}

	/**
	 * 判断当前位置在对应的窗口中是否会被遮挡
	 * 用于iframe嵌套的场景
	 * @param position
	 * @param currentWindow
	 */
	private isSheltered(position, currentWindow) {
		if(position.left < 0 || position.top < 0
			|| position.right > currentWindow.document.documentElement.clientWidth
			|| position.bottom > currentWindow.document.documentElement.clientHeight) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * 递归判断当前元素是否会被视口遮挡
	 * @param element
	 * @param currentWindow
	 * @param position
	 */
	public getShelter(element, currentWindow, position) {
		var rect = element.getBoundingClientRect();
		position.left += rect.left;
		position.right += rect.left;
		position.top += rect.top;
		position.bottom += rect.top;

		if(this.isSheltered(position, currentWindow)) {
			return element;
		} else {
			if(currentWindow.parent != currentWindow) { // 判断是否到达最顶级容器
				var pElement = this.getParentElement(currentWindow);
				return this.getShelter(pElement, currentWindow.parent, position);
			} else {
				return null;
			}
		}
	}

	/**
	 * 查找当前容器在父窗口中的dom元素
	 * 如：iframe场景中，则为在子页面中查找父页面中的iframe节点
	 * @param currentWindow
	 */
	public getParentElement(currentWindow) {
		if(currentWindow.parent !== currentWindow) {
			var parentWindow = currentWindow.parent;
			var frames = parentWindow.document.getElementsByTagName("iframe");
			for(var i=0; i<frames.length; i++) {
				if(frames[i].contentWindow === currentWindow) {
					return frames[i];
				}
			}
		}
	}

    private getBoundingClientRect(placementPrimary, placementSecondary, hostElement, targetElement) {
        const hostBcr = hostElement.getBoundingClientRect();

        // const shiftWidth = {
        //     left: hostBcr.left,
        //     center: hostBcr.left + hostElement.offsetWidth/2 - targetElement.offsetWidth/2,
        //     right: hostBcr.left + hostElement.offsetWidth,
        // };
        // const shiftHeight = {
        //     top: hostBcr.top,
        //     center: hostBcr.top + hostElement.offsetHeight/2 - targetElement.offsetHeight/2,
        //     bottom: hostBcr.top + hostElement.offsetHeight,
        // };

        const shiftWidth: any = {
            left: hostBcr.left,
            center: hostBcr.left + hostBcr.width / 2 - targetElement.offsetWidth / 2,
            right: hostBcr.right - targetElement.offsetWidth
        };
        const shiftHeight: any = {
            top: hostBcr.top,
            center: hostBcr.top + hostBcr.height / 2 - targetElement.offsetHeight / 2,
            bottom: hostBcr.bottom - targetElement.offsetHeight
        };
        switch (placementPrimary) {
            case 'top':
                return {
                    top: hostBcr.top - targetElement.offsetHeight,
                    bottom: hostBcr.top,
                    left: shiftWidth[placementSecondary],
                    right: shiftWidth[placementSecondary] + targetElement.offsetWidth
                };
            case 'bottom':
                return {
                    top: hostBcr.bottom,
                    bottom: hostBcr.bottom + targetElement.offsetHeight,
                    left: shiftWidth[placementSecondary],
                    right: shiftWidth[placementSecondary] + targetElement.offsetWidth
                };
            case 'left':
                return {
                    top: shiftHeight[placementSecondary],
                    bottom: shiftHeight[placementSecondary] + targetElement.offsetHeight,
                    left: hostBcr.left - targetElement.offsetWidth,
                    right: hostBcr.left
                };
            case 'right':
                return {
                    top: shiftHeight[placementSecondary],
                    bottom: shiftHeight[placementSecondary] + targetElement.offsetHeight,
                    left: hostBcr.right,
                    right: hostBcr.right + targetElement.offsetWidth,
                };
        }
    }

	public  positionElements(hostElement: HTMLElement, targetElement: HTMLElement, placement: string, appendToBody?: boolean): ClientRect {
        const hostElPosition = appendToBody ? this.offset(hostElement, false) : this.position(hostElement, false);
        const shiftWidthPri: any = {
            left: hostElPosition.left,
            right: hostElPosition.left + hostElPosition.width
        };
        const shiftHeightPri: any = {
            top: hostElPosition.top,
            bottom: hostElPosition.top + hostElPosition.height
        };
        const targetElBCR = targetElement.getBoundingClientRect();
        placement = this.getPlacementPrimary(hostElement, targetElement, placement);
        let placementPrimary = placement.split('-')[0] || 'top';
        const placementSecondary = placement.split('-')[1] || 'center';

        let targetElPosition: ClientRect = {
            height: targetElBCR.height || targetElement.offsetHeight,
            width: targetElBCR.width || targetElement.offsetWidth,
            top: 0,
            bottom: targetElBCR.height || targetElement.offsetHeight,
            left: 0,
            right: targetElBCR.width || targetElement.offsetWidth
        };
      const shiftWidthSec: any = {
          left: hostElPosition.left,
          center: hostElPosition.left + hostElPosition.width / 2 - targetElement.offsetWidth / 2,
          right: hostElPosition.right - targetElement.offsetWidth
      };
      const shiftHeightSec: any = {
          top: hostElPosition.top,
          center: hostElPosition.top + hostElPosition.height / 2 - targetElement.offsetHeight / 2,
          bottom: hostElPosition.bottom - targetElement.offsetHeight
      };

        switch (placementPrimary) {
            case 'top':
                targetElPosition.top = hostElPosition.top - targetElement.offsetHeight;
                targetElPosition.bottom += hostElPosition.top - targetElement.offsetHeight;
                targetElPosition.left = shiftWidthSec[placementSecondary];
                targetElPosition.right += shiftWidthSec[placementSecondary];
                break;
            case 'bottom':
                targetElPosition.top = shiftHeightPri[placementPrimary];
                targetElPosition.bottom += shiftHeightPri[placementPrimary];
                targetElPosition.left = shiftWidthSec[placementSecondary];
                targetElPosition.right += shiftWidthSec[placementSecondary];
                break;
            case 'left':
                targetElPosition.top = shiftHeightSec[placementSecondary];
                targetElPosition.bottom += shiftHeightSec[placementSecondary];
                targetElPosition.left = hostElPosition.left - targetElement.offsetWidth;
                targetElPosition.right += hostElPosition.left - targetElement.offsetWidth;
                break;
            case 'right':
                targetElPosition.top = shiftHeightSec[placementSecondary];
                targetElPosition.bottom += shiftHeightSec[placementSecondary];
                targetElPosition.left = shiftWidthPri[placementPrimary];
                targetElPosition.right += shiftWidthPri[placementPrimary];
                break;
        }

        targetElPosition.top = Math.round(targetElPosition.top);
        targetElPosition.bottom = Math.round(targetElPosition.bottom);
        targetElPosition.left = Math.round(targetElPosition.left);
        targetElPosition.right = Math.round(targetElPosition.right);

        return targetElPosition;
    }

	public  positionElements_bak(hostElement: HTMLElement, targetElement: HTMLElement, placement: string, appendToBody?: boolean): ClientRect {
        const hostElPosition = appendToBody ? this.offset(hostElement, false) : this.position(hostElement, false);
        const shiftWidth: any = {
            left: hostElPosition.left,
            center: hostElPosition.left + hostElPosition.width / 2 - targetElement.offsetWidth / 2,
            right: hostElPosition.left + hostElPosition.width
        };
        const shiftHeight: any = {
            top: hostElPosition.top,
            center: hostElPosition.top + hostElPosition.height / 2 - targetElement.offsetHeight / 2,
            bottom: hostElPosition.top + hostElPosition.height
        };
        const targetElBCR = targetElement.getBoundingClientRect();
        const placementPrimary = placement.split('-')[0] || 'top';
        const placementSecondary = placement.split('-')[1] || 'center';

        let targetElPosition: ClientRect = {
            height: targetElBCR.height || targetElement.offsetHeight,
            width: targetElBCR.width || targetElement.offsetWidth,
            top: 0,
            bottom: targetElBCR.height || targetElement.offsetHeight,
            left: 0,
            right: targetElBCR.width || targetElement.offsetWidth
        };

        switch (placementPrimary) {
            case 'top':
                targetElPosition.top = hostElPosition.top - targetElement.offsetHeight;
                targetElPosition.bottom += hostElPosition.top - targetElement.offsetHeight;
                targetElPosition.left = shiftWidth[placementSecondary];
                targetElPosition.right += shiftWidth[placementSecondary];
                break;
            case 'bottom':
                targetElPosition.top = shiftHeight[placementPrimary];
                targetElPosition.bottom += shiftHeight[placementPrimary];
                targetElPosition.left = shiftWidth[placementSecondary];
                targetElPosition.right += shiftWidth[placementSecondary];
                break;
            case 'left':
                targetElPosition.top = shiftHeight[placementSecondary];
                targetElPosition.bottom += shiftHeight[placementSecondary];
                targetElPosition.left = hostElPosition.left - targetElement.offsetWidth;
                targetElPosition.right += hostElPosition.left - targetElement.offsetWidth;
                break;
            case 'right':
                targetElPosition.top = shiftHeight[placementSecondary];
                targetElPosition.bottom += shiftHeight[placementSecondary];
                targetElPosition.left = shiftWidth[placementPrimary];
                targetElPosition.right += shiftWidth[placementPrimary];
                break;
        }

        targetElPosition.top = Math.round(targetElPosition.top);
        targetElPosition.bottom = Math.round(targetElPosition.bottom);
        targetElPosition.left = Math.round(targetElPosition.left);
        targetElPosition.right = Math.round(targetElPosition.right);

        return targetElPosition;
    }
}

const positionService = new Positioning();
export function positionElements(hostElement: HTMLElement, targetElement: HTMLElement, placement: string, appendToBody?: boolean): void {
    const pos = positionService.positionElements(hostElement, targetElement, placement, appendToBody);

    targetElement.style.top = `${pos.top}px`;
    targetElement.style.left = `${pos.left}px`;
}

export function getPlacement(hostElement: HTMLElement, targetElement: HTMLElement, placement: string): any {
    const placementPrimary = positionService.getPlacementPrimary(hostElement, targetElement, placement);
	console.log(placementPrimary);
	return placementPrimary;
}
