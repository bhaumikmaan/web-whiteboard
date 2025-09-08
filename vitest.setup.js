import '@testing-library/jest-dom'

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16)
global.cancelAnimationFrame = (id) => clearTimeout(id)

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () => ({
    setTransform() {},
    clearRect() {},
    save() {},
    translate() {},
    scale() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    restore() {},
  }),
})

HTMLCanvasElement.prototype.getBoundingClientRect = function () {
  return { width: 800, height: 600, top: 0, left: 0, bottom: 600, right: 800, x: 0, y: 0, toJSON() {} }
}
