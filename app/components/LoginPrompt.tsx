import { FaGithub } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { useAuth } from '../contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LoginPrompt() {
  const t = useTranslations();
  const { login } = useAuth();

  return (
    <Card>
      <CardContent className="text-center p-8">
        <FaGithub className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium text-foreground">
          {t('common.loginRequired')}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{t('common.loginToManage')}</p>
        <Button onClick={login} className="mt-4 inline-flex items-center">
          <FaGithub className="mr-2" />
          {t('common.loginWithGithub')}
        </Button>
      </CardContent>
    </Card>
  );
}
