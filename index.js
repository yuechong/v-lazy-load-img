import { PLACEHOLDER_IMG, LOADING_GIF } from './conf';
import { remove, getScrollTop, throttle } from './utils';
import Queue from './queue';

export default {
  install(Vue, options = {}) {
    // 最大渲染图片个数
    const RENDER_SIZE = options['RENDER_SIZE'] || 6;
    // 最大缓存个数
    const MAX_LENGTH = options['MAX_LENGTH'] || 120;
    // 加载中的图片
    const IMG_LOAD_SRC = options['IMG_LOAD_SRC'] || LOADING_GIF;
    // 加载前的图片
    const IMG_LOAD_BEFORE_SRC = options['IMG_LOAD_BEFORE_SRC'] || PLACEHOLDER_IMG;
    // 加载失败的图片
    const IMG_LOAD_ERROR_SRC = options['IMG_LOAD_ERROR_SRC'] || '';
    // 缓存全部未加载的图片位置数据
    const caches = [];
    // 加载过的图片
    const keys = [];
    // 渲染Function
    function render(item) {
      if (!item) {
        return;
      }
      const { key, el } = item;
      loadImage(key, el);
    }
    // 待渲染队列
    const queueData = new Queue(RENDER_SIZE, render);

    /**
     * 预加载图片
     * @date 2022-03-23
     * @param {any} src
     * @param {any} el
     * @returns {any}
     */
    function loadImage(src, el) {
      // console.log(src, el);
      // 缓存中读取
      if (keys.indexOf(src) > -1) {
        el.src = src;
        // 开始调度
        queueData.renderSuccess(item => item.key === src);
        return;
      }
      const img = new Image();
      img.onload = function() {
        el.src = src;
        keysCache(src);
        // 开始调度
        queueData.renderSuccess(item => item.key === src);
      };
      img.onerror = function() {
        el.src = IMG_LOAD_ERROR_SRC;
      };
      img.src = src;
      // el 开始loading
      el.src = IMG_LOAD_SRC;
    }

    let kid = 0;

    /**
     * 缓存全部图片标签
     * @date 2022-03-23
     * @param {any} key
     * @param {any} el
     * @returns {any}
     */
    function pushCache(key, el) {
      // 计算偏移量
      const { top } = el.getBoundingClientRect();
      kid++;
      caches.push({ key, el, top, kid });
      // console.log('caches', caches);
    }

    /**
     * 缓存图片src路径
     * @date 2022-03-25
     * @param {any} key
     * @returns {any}
     */
    function keysCache(key) {
      // 加载完的图片，添加到keys数组中
      if (keys.length > MAX_LENGTH) {
        remove(keys, keys[0]);
      }
      keys.push(key);
    }

    /**
     * 滚动事件
     * @date 2022-03-25
     * @param {any}
     * @returns {any}
     */
    const onScrollFn = throttle(e => {
      // 遍历所有cache中的top高度
      const viewHeight = document.body.clientHeight + getScrollTop();
      if (!caches.length) {
        return;
      }
      caches.sort((a, b) => (b.top - a.top === 0 ? b.kid - a.kid : b.top - a.top));
      // 遍历循环，符合条件的存入awaitQueues
      for (let i = caches.length - 1; i > -1; i--) {
        const { key, el, top } = caches[i];
        if (Math.abs(top) < viewHeight) {
          // 开始加载突破
          queueData.pushAwaitQueues({ key, el });
          // 删除
          caches.splice(i, 1);
        }
      }
    }, 100);

    Vue.directive('img', {
      inserted: (el, bindings) => {
        const { value } = bindings;
        pushCache(value, el);
        el.src = IMG_LOAD_BEFORE_SRC;
        if (!Vue.ZSCROLL) {
          Vue.ZSCROLL = true;
          setTimeout(() => {
            onScrollFn();
          }, 500);
          window.addEventListener('scroll', onScrollFn);
        }
      },
      unbind: () => {
        if (!caches.length) {
          Vue.ZSCROLL = false;
          window.removeEventListener('scroll', onScrollFn);
        }
      }
    });
  }
};
