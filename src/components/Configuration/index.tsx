import React, { useState, useEffect, useCallback } from 'react';

import GitHubService from '../../services/github';
import Input from '../Input';
import Select, { ISelectOption } from '../Select';
import Button from '../Button';

import { containerStyle, actionsContainerStyle } from './styles';

interface IConfigurationProps {
  insomniaContext: IInsomniaContext;
}

const Configuration: React.FC<IConfigurationProps> = ({ insomniaContext }) => {
  const [provider, setProvider] = useState<string | null>('github');
  const [apiKey, setApiKey] = useState<string | null>('');
  const [gistKey, setGistKey] = useState<string | null>('');
  const [ignoredWorkspaces, setIgnoredWorkspaces] = useState<string | null>('');
  const [gistOptions, setGistsOptions] = useState<ISelectOption[]>([]);

  useEffect(() => {
    async function loadGists() {
      const CREATE_NEW_OPTION = { label: 'Create new...', value: null };
      try {
        if (!apiKey) throw new Error('API Key not provided.');
        const gitHubService = new GitHubService(apiKey);
        const gists = await gitHubService.getGists();
        const options: ISelectOption[] = gists.map(gist => ({
          label: `${gist.description} (ID: ${gist.id})`,
          value: gist.id,
        }));
        setGistsOptions([CREATE_NEW_OPTION, ...options]);
      } catch (error) {
        setGistsOptions([CREATE_NEW_OPTION]);
      }
    }
    loadGists();
  }, [apiKey]);

  useEffect(() => {
    async function load() {
      const newApiKey = await insomniaContext.store.getItem(
        'gist-sync:api-key',
      );
      const newGistKey = await insomniaContext.store.getItem(
        'gist-sync:gist-key',
      );
      const newIgnoredWorkspaces = await insomniaContext.store.getItem(
        'gist-sync:ignored-workspaces',
      );
      setApiKey(newApiKey);
      setGistKey(newGistKey);
      setIgnoredWorkspaces(newIgnoredWorkspaces);
    }
    load();
  }, []);

  const handleConfirm = useCallback(() => {
    async function execute() {
      await insomniaContext.store.setItem('gist-sync:api-key', apiKey ?? '');
      await insomniaContext.store.setItem('gist-sync:gist-key', gistKey ?? '');
      await insomniaContext.store.setItem(
        'gist-sync:ignored-workspaces',
        ignoredWorkspaces ?? '',
      );
    }
    execute();
  }, [apiKey, gistKey, ignoredWorkspaces]);
  return (
    <div css={containerStyle}>
      <Select
        label="Provider"
        options={[{ label: 'GitHub', value: 'github' }]}
        value="provider"
        onChange={event => setProvider(event.target.value)}
      />
      <Input
        label="Gist API Key"
        value={apiKey}
        onChange={event => setApiKey(event.target.value)}
      />
      <Select
        label="Gist"
        options={gistOptions}
        value={gistKey}
        onChange={event => setGistKey(event.target.value)}
      />
      <Input
        label="Ignore Workspaces"
        value={ignoredWorkspaces}
        placeholder="add comma-separated workspace names"
        onChange={event => setIgnoredWorkspaces(event.target.value)}
      />
      <div css={actionsContainerStyle}>
        <Button label="Cancel" closeModal />
        <Button label="Confirm" onClick={handleConfirm} closeModal />
      </div>
    </div>
  );
};

export default Configuration;
