const TEXT_ELEMENT = "TEXT_ELEMENT";

let nextUnitOfWork = null;
let wipRoot = null;

function createTextElement(text) {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: [],
    },
  };
}
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function commitRoot() {
  commitWork(wipRoot.child);
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  fiber.parent.dom.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };
  nextUnitOfWork = wipRoot;
}

function createDom(fiber) {
  const dom =
    fiber.type == TEXT_ELEMENT
      ? document.createTextNode("")
      : document.createElement(fiber.type);
  const { children, ...props } = fiber.props;
  // assign props
  Object.keys(props).forEach((name) => {
    dom[name] = props[name];
  });
  return dom;
}

function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // create fibers for children
  const children = fiber.props.children;
  let prevSibling = null;
  children.forEach((child, index) => {
    const currentFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
    };

    if (index === 0) {
      fiber.child = currentFiber;
    } else {
      prevSibling.sibling = currentFiber;
    }
    prevSibling = currentFiber;
  });

  // return next unit of work
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);

const Doact = {
  createElement,
  render,
};

/** @jsx Doact.createElement */
const element = (
  <div id="foo">
    <h1>
      <span>Hello world</span>
      <span>^.^</span>
    </h1>
    <div style="width:100px;height:100px;border:1px solid;"></div>
  </div>
);
const container = document.getElementById("root");
Doact.render(element, container);
