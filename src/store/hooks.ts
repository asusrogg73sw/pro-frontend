import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux'; // 'type' keyword lagana zaroori hai
import type { RootState, AppDispatch } from './index';

// Ab inhein use karein
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;