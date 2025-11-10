import React from 'react'

import "./includes.scss"

const Header = () => {
    return (
        <header id='header'>
            <div className='bg-red-500 content-container'>
                <div className='logo'>
                    <span className='bg-dark text-primary'>JOB CHAIYE ?</span>
                </div>
                <div className='search-bar'>
                    <input type="search" />
                </div>
                <div className='account'>
                    {/* if user is loged in then hello, user name ! */}
                    {/* if not login/register */}
                </div>
            </div>
        </header>
    )
}

export default Header