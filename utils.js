/**
 * 数组删除
 * @date 2022-03-25
 * @param {any} keys
 * @param {any} key
 * @returns {any}
 */
export function remove(keys, key) {
  if (keys.length) {
    const index = keys.indexOf(key);
    if (index > -1) {
      return keys.splice(index, 1);
    }
  }
}

/**
 * 获取滚动条高度
 * @date 2022-03-25
 * @returns {any}
 */
export function getScrollTop() {
  let scroll_top = 0;
  if (document.documentElement && document.documentElement.scrollTop) {
    scroll_top = document.documentElement.scrollTop;
  } else if (document.body) {
    scroll_top = document.body.scrollTop;
  }
  return scroll_top;
}

/**
 * 节流函数
 * @date 2021-07-15
 * @param {function} fn
 * @param {number} wait
 * @returns {any}
 */
export function throttle(fn, wait) {
  let previous = 0;
  // eslint-disable-next-line func-names
  return function() {
    const now = Date.now();
    if (now - previous > wait) {
      fn.apply(this, arguments);
      previous = now;
    }
  };
}

export function findIndexByKey(arr, filter) {
  for (let i = 0; i < arr.length; i++) {
    if (filter(arr[i])) {
      return i;
    }
  }
  return -1;
}
export const noop = () => {};
