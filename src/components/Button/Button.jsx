import React from 'react'

function Button({
    label="Button",
    type="Button",
    className='',
    disabled=false,
}) {
  return (
    <div>
      <button type={type} class={`bg-blue-400 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${className}`} disabled={disabled}>
       {label}
       </button>
    </div>
  )
}

export default Button
