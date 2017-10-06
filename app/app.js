import React from 'react'
import ReactDOM from 'react-dom'
import image from './cat-image.jpg'
import someFunction from './some-function'

const render = () => {
  console.log('rendering', someFunction)
  ReactDOM.render(
    <div>
      <h1>Test app</h1>
      <img src={image} />
      <button onClick={() => console.log(someFunction())}>Click me</button>
    </div>,
    document.getElementById('entry')
  )
}

render()
