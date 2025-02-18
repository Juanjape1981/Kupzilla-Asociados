import { createSelector } from 'reselect';
import { RootState } from '../store/store';
import { Branch, Rating } from '../types/types';

// Selector para obtener las sucursales del usuario
const getBranches = (state: RootState) => state.branch.branches;
// Selector para obtener todas las sucursales
export const getAllBranches = (state: RootState) => state.branch.allBranches;
// Selector para obtener las valoraciones de ramas
const getBranchRatingsState = (state: RootState) => state.branch.branchRatings;

// Selector memorizado para sucursales del usuario
export const getMemoizedBranches = createSelector(
  [getBranches],
  (branches: Branch[] | null) => {
    return branches ? branches.slice() : [];
  }
);

// Selector memorizado para todas las sucursales
export const getMemoizedAllBranches = createSelector(
  [getAllBranches],
  (allBranches: Branch[] | null) => {
    return allBranches ? allBranches.slice() : [];
  }
);

// Selector memorizado para valoraciones de ramas
export const getMemoizedBranchRatingsWithMetadata = createSelector(
  [getBranchRatingsState],
  (branchRatingsState) => ({
    ratings: branchRatingsState.ratings.slice(),
    average_rating: branchRatingsState.average_rating,
    loading: branchRatingsState.loading,
    error: branchRatingsState.error,
  })
);