import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthProvider';

const TeamContext = createContext(null);

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

const TEAM_STORAGE_KEY = 'walkup-current-team';

function TeamProvider({ children }) {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load teams when user changes
  const loadTeams = useCallback(async () => {
    if (!user) {
      setTeams([]);
      setCurrentTeam(null);
      setUserRole(null);
      setUserType(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_my_teams');

      if (error) {
        console.error('Error loading teams:', error);
        setTeams([]);
        setLoading(false);
        return;
      }

      const teamList = data || [];
      setTeams(teamList);

      if (teamList.length === 0) {
        setCurrentTeam(null);
        setUserRole(null);
        setUserType(null);
        setLoading(false);
        return;
      }

      // Try to restore the last-selected team from localStorage
      let savedTeamId = null;
      if (typeof window !== 'undefined') {
        savedTeamId = localStorage.getItem(TEAM_STORAGE_KEY);
      }

      const savedTeam = savedTeamId
        ? teamList.find((t) => t.team_id === savedTeamId)
        : null;

      const active = savedTeam || teamList[0];
      setCurrentTeam({ id: active.team_id, name: active.team_name });
      setUserRole(active.role);
      setUserType(active.user_type);
    } catch (err) {
      console.error('Error loading teams:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  // Switch active team
  const switchTeam = useCallback(
    (teamId) => {
      const team = teams.find((t) => t.team_id === teamId);
      if (!team) return;

      setCurrentTeam({ id: team.team_id, name: team.team_name });
      setUserRole(team.role);
      setUserType(team.user_type);

      if (typeof window !== 'undefined') {
        localStorage.setItem(TEAM_STORAGE_KEY, teamId);
      }
    },
    [teams]
  );

  // Create a new team and become its admin
  const createTeam = useCallback(
    async (teamName, memberType = 'coach') => {
      if (!user) throw new Error('Not authenticated');

      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({ name: teamName, created_by: user.id })
        .select()
        .single();

      if (teamError) throw teamError;

      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          user_id: user.id,
          team_id: team.id,
          user_type: memberType,
          role: 'admin',
        });

      if (memberError) throw memberError;

      // Reload teams and switch to the new one
      await loadTeams();
      switchTeam(team.id);

      return team;
    },
    [user, loadTeams, switchTeam]
  );

  // Join a team via invite code
  const joinTeam = useCallback(
    async (inviteCode, memberType = 'player') => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('claim_invite_code', {
        invite_code: inviteCode.toUpperCase().trim(),
        member_type: memberType,
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to join team');

      // Reload teams and switch to the joined team
      await loadTeams();
      if (data.team_id) {
        switchTeam(data.team_id);
      }

      return data;
    },
    [user, loadTeams, switchTeam]
  );

  // Permission helpers
  const isAdmin = userRole === 'admin';
  const isCoach = userRole === 'coach' || userRole === 'admin';
  const isPlayer = userRole === 'player';

  const value = {
    teams,
    currentTeam,
    userRole,
    userType,
    loading,
    switchTeam,
    createTeam,
    joinTeam,
    loadTeams,
    isAdmin,
    isCoach,
    isPlayer,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export default TeamProvider;
