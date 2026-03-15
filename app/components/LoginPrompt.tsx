import { FaGithub } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';
import { useApp } from '../contexts/AppContext';

export default function LoginPrompt() {
  const { t } = useTranslation();
  const { login } = useApp();

  return (
    <div className="text-center bg-[#161b22] border border-gray-700 rounded-lg p-8">
      <FaGithub className="mx-auto h-12 w-12 text-gray-600" />
      <h3 className="mt-2 text-lg font-medium text-gray-100">
        {t('common.loginRequired')}
      </h3>
      <p className="mt-1 text-sm text-gray-500">{t('common.loginToManage')}</p>
      <button
        onClick={login}
        className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-500"
      >
        <FaGithub className="mr-2" />
        {t('common.loginWithGithub')}
      </button>
    </div>
  );
}
