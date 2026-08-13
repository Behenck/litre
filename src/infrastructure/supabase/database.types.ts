export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  city: string;
  state: string;
  region_key: string;
  email_verified_at: string | null;
  created_at: string;
};

type SessionRow = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
};

type EmailVerificationRow = {
  token_hash: string;
  user_id: string;
  expires_at: string;
  created_at: string;
};

type PasswordResetRow = {
  token_hash: string;
  user_id: string;
  expires_at: string;
  created_at: string;
};

type VehicleRow = {
  id: string;
  user_id: string;
  type: string;
  brand: string;
  model: string;
  year: number | null;
  plate: string;
  color: string;
  color_name: string;
  main_fuel: string;
  nickname: string;
  initial_odometer: number;
  created_at: string;
};

type FillUpRow = {
  id: string;
  user_id: string;
  vehicle_id: string;
  date: string;
  odometer: number;
  liters: number;
  total_cents: number;
  fuel: string;
  station_name: string;
  full_tank: boolean;
  created_at: string;
};

type StationRow = {
  id: string;
  name: string;
  name_key: string;
  city: string;
  state: string;
  region_key: string;
  gasoline_cents: number | null;
  ethanol_cents: number | null;
  diesel_cents: number | null;
  price_date: string;
  updated_at: string;
  updated_by: string | null;
  updated_by_name: string;
};

type StationPriceHistoryRow = {
  id: string;
  station_id: string;
  gasoline_cents: number | null;
  ethanol_cents: number | null;
  diesel_cents: number | null;
  price_date: string;
  recorded_by: string | null;
  recorded_by_name: string;
  recorded_at: string;
};

/** Toda tabela com `user_id` aponta para a mesma conta dona do dado. */
type UserRelation<Name extends string> = {
  foreignKeyName: Name;
  columns: ['user_id'];
  isOneToOne: false;
  referencedRelation: 'users';
  referencedColumns: ['id'];
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: UserRow;
        Update: Partial<UserRow>;
        Relationships: [];
      };
      sessions: {
        Row: SessionRow;
        Insert: SessionRow;
        Update: Partial<SessionRow>;
        Relationships: [UserRelation<'sessions_user_id_fkey'>];
      };
      email_verifications: {
        Row: EmailVerificationRow;
        Insert: EmailVerificationRow;
        Update: Partial<EmailVerificationRow>;
        Relationships: [UserRelation<'email_verifications_user_id_fkey'>];
      };
      password_resets: {
        Row: PasswordResetRow;
        Insert: PasswordResetRow;
        Update: Partial<PasswordResetRow>;
        Relationships: [UserRelation<'password_resets_user_id_fkey'>];
      };
      vehicles: {
        Row: VehicleRow;
        Insert: VehicleRow;
        Update: Partial<VehicleRow>;
        Relationships: [UserRelation<'vehicles_user_id_fkey'>];
      };
      fill_ups: {
        Row: FillUpRow;
        Insert: FillUpRow;
        Update: Partial<FillUpRow>;
        Relationships: [
          {
            foreignKeyName: 'fill_ups_vehicle_id_fkey';
            columns: ['vehicle_id'];
            isOneToOne: false;
            referencedRelation: 'vehicles';
            referencedColumns: ['id'];
          },
          UserRelation<'fill_ups_user_id_fkey'>,
        ];
      };
      stations: {
        Row: StationRow;
        Insert: StationRow;
        Update: Partial<StationRow>;
        Relationships: [];
      };
      station_price_history: {
        Row: StationPriceHistoryRow;
        Insert: StationPriceHistoryRow;
        Update: Partial<StationPriceHistoryRow>;
        Relationships: [
          {
            foreignKeyName: 'station_price_history_station_id_fkey';
            columns: ['station_id'];
            isOneToOne: false;
            referencedRelation: 'stations';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<Name extends keyof Database['public']['Tables']> = Database['public']['Tables'][Name]['Row'];
