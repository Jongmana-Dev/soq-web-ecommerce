import { useTranslations } from 'next-intl'
import { Link as I18nLink } from '@/i18n/navigation'

export function Brand() {
  const t = useTranslations('brand')
  return (
    <I18nLink href="/" className="font-poppins font-semibold text-2xl">
      {t('name', { default: 'SOQ' })}
    </I18nLink>
  )
}