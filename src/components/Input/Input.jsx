import React from 'react'

function Input(
    {label='',
    name='',
    type="text",
    className='',
    isRequired=true,
    placeholder='',
    value='',
    onChange=()=>{}
}
) {
  return (
    <div>
        <label 
            for={name} 
            className="block mb-2 text-sm font-medium"
        >
            {label}

        </label>
        <input 
            type={type} 
            id={name} 
            className={`bg-gray-50 border border-gray-300 ${className}`}
            placeholder={placeholder} 
            required={isRequired}
            value={value}
            onChange={onChange}
        />
    </div>
  )
}

export default Input
