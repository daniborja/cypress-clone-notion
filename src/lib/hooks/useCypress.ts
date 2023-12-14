'use client';

import { useContext } from 'react';

import { CypressContext } from '../context/cypress/CypressContext';

export const useCypress = () => useContext(CypressContext);
