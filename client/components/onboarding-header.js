
import logoWhite from 'img/logo-white.svg'
import logoIconWhite from 'img/logo-icon-white.svg'
import style from 'sass/components/header'


export default function () {
  return (
    <nav className={`mui-appbar ${style.root} onboarding-header`}>
      <div className='brand'>
        <img src={logoWhite} alt='Spendwell' className='logo'/>
        <img src={logoIconWhite} alt='Spendwell' className='logo-icon'/>
      </div>
    </nav>
  )
}
