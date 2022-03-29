import { findIndexByKey, noop } from './utils';
class Queue {
  constructor(size = 6, render = noop) {
    this.renderSize = size;
    this.awaitQueues = [];
    this.renderQueues = [];
    this.render = render;
  }

  /**
   * 添加到等待队列
   * @date 2022-03-25
   * @param {any} item
   * @returns {any}
   */
  pushAwaitQueues(item) {
    this.awaitQueues.push(item);
    this.pushRenderQueues();
  }

  /**
   * 添加到渲染队列
   * @date 2022-03-25
   * @returns {any}
   */
  pushRenderQueues() {
    // 判断渲染队列的渲染情况
    if (this.renderQueues.length < this.renderSize) {
      // 开始调度
      this.dispatch(null, this.awaitQueues.shift());
      // 判断等待队列，有值就继续添加
      if (this.awaitQueues.length) {
        this.pushRenderQueues();
      }
    }
  }

  /**
   * 调度
   * @date 2022-03-25
   * @param {any} index
   * @param {any} item
   * @returns {any}
   */
  dispatch(index, item) {
    if (index) {
      this.renderQueues[index] = item;
    } else {
      this.renderQueues.push(item);
    }
    // 渲染
    this.render(item);
  }

  /**
   * 渲染成功，调度一下个
   * @date 2022-03-25
   * @param {any} key
   * @param {any} callbackFn
   * @returns {any}
   */
  renderSuccess(matchFn) {
    // 渲染完的位置
    const index = findIndexByKey(this.renderQueues, matchFn);
    if (index > -1 && this.awaitQueues.length) {
      this.dispatch(index, this.awaitQueues.shift());
    } else if (index > -1 && !this.awaitQueues.length) {
      // 清空并删除
      this.renderQueues[index] = null;
      this.renderQueues.splice(index, 1);
    }
  }
}

export default Queue;
