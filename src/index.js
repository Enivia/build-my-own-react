const TEXT_ELEMENT = "TEXT_ELEMENT";

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

function render(element, container) {
  // create dom
  const dom =
    element.type == TEXT_ELEMENT
      ? document.createTextNode("")
      : document.createElement(element.type);
  const { children, ...props } = element.props;
  // recursive create children
  children.forEach((child) => render(child, dom));
  // assign props
  Object.keys(props).forEach((name) => {
    dom[name] = props[name];
  });
  container.appendChild(dom);
}

const Doact = {
  createElement,
  render,
};

/** @jsx Doact.createElement */
const element = (
  <div id="foo">
    <h1>Hello world</h1>
    <div style="width:100px;height:100px;border:1px solid;"></div>
  </div>
);
const container = document.getElementById("root");
Doact.render(element, container);
