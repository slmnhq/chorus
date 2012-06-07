--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: queue_classic_jobs; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE queue_classic_jobs (
    id integer NOT NULL,
    q_name character varying(255),
    method character varying(255),
    args text,
    locked_at timestamp with time zone
);


--
-- Name: lock_head(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION lock_head(tname character varying) RETURNS SETOF queue_classic_jobs
    LANGUAGE plpgsql
    AS $_$
BEGIN
  RETURN QUERY EXECUTE 'SELECT * FROM lock_head($1,10)' USING tname;
END;
$_$;


--
-- Name: lock_head(character varying, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION lock_head(q_name character varying, top_boundary integer) RETURNS SETOF queue_classic_jobs
    LANGUAGE plpgsql
    AS $_$
DECLARE
  unlocked integer;
  relative_top integer;
  job_count integer;
BEGIN
  -- The purpose is to release contention for the first spot in the table.
  -- The select count(*) is going to slow down dequeue performance but allow
  -- for more workers. Would love to see some optimization here...

  EXECUTE 'SELECT count(*) FROM '
    || '(SELECT * FROM queue_classic_jobs WHERE q_name = '
    || quote_literal(q_name)
    || ' LIMIT '
    || quote_literal(top_boundary)
    || ') limited'
  INTO job_count;

  SELECT TRUNC(random() * (top_boundary - 1))
  INTO relative_top;

  IF job_count < top_boundary THEN
    relative_top = 0;
  END IF;

  LOOP
    BEGIN
      EXECUTE 'SELECT id FROM queue_classic_jobs '
        || ' WHERE locked_at IS NULL'
        || ' AND q_name = '
        || quote_literal(q_name)
        || ' ORDER BY id ASC'
        || ' LIMIT 1'
        || ' OFFSET ' || quote_literal(relative_top)
        || ' FOR UPDATE NOWAIT'
      INTO unlocked;
      EXIT;
    EXCEPTION
      WHEN lock_not_available THEN
        -- do nothing. loop again and hope we get a lock
    END;
  END LOOP;

  RETURN QUERY EXECUTE 'UPDATE queue_classic_jobs '
    || ' SET locked_at = (CURRENT_TIMESTAMP)'
    || ' WHERE id = $1'
    || ' AND locked_at is NULL'
    || ' RETURNING *'
  USING unlocked;

  RETURN;
END;
$_$;


--
-- Name: gpdb_database_objects; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE gpdb_database_objects (
    id integer NOT NULL,
    type character varying(256),
    name character varying(256),
    schema_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    master_table boolean DEFAULT false
);


--
-- Name: gpdb_database_objects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE gpdb_database_objects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gpdb_database_objects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE gpdb_database_objects_id_seq OWNED BY gpdb_database_objects.id;


--
-- Name: gpdb_databases; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE gpdb_databases (
    id integer NOT NULL,
    instance_id integer NOT NULL,
    name character varying(256),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: gpdb_databases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE gpdb_databases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gpdb_databases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE gpdb_databases_id_seq OWNED BY gpdb_databases.id;


--
-- Name: gpdb_schemas; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE gpdb_schemas (
    id integer NOT NULL,
    name character varying(256),
    database_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    database_objects_count integer DEFAULT 0
);


--
-- Name: gpdb_schemas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE gpdb_schemas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gpdb_schemas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE gpdb_schemas_id_seq OWNED BY gpdb_schemas.id;


--
-- Name: hadoop_instances; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE hadoop_instances (
    id integer NOT NULL,
    name character varying(256),
    description text,
    host character varying(256),
    port integer,
    owner_id integer NOT NULL,
    version character varying(256),
    username character varying(256),
    group_list character varying(256),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    online boolean DEFAULT true
);


--
-- Name: hadoop_instances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE hadoop_instances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hadoop_instances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE hadoop_instances_id_seq OWNED BY hadoop_instances.id;


--
-- Name: instance_accounts; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE instance_accounts (
    id integer NOT NULL,
    db_username character varying(256),
    db_password bytea,
    instance_id integer NOT NULL,
    owner_id integer NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: instance_credentials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE instance_credentials_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: instance_credentials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE instance_credentials_id_seq OWNED BY instance_accounts.id;


--
-- Name: instances; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE instances (
    id integer NOT NULL,
    name character varying(256),
    description text,
    host character varying(256),
    port integer,
    maintenance_db character varying(256),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    owner_id integer NOT NULL,
    shared boolean DEFAULT false,
    provision_type character varying(256),
    instance_provider character varying(256),
    version character varying(256),
    online boolean DEFAULT true
);


--
-- Name: instances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE instances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: instances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE instances_id_seq OWNED BY instances.id;


--
-- Name: memberships; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE memberships (
    id integer NOT NULL,
    user_id integer NOT NULL,
    workspace_id integer NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: memberships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE memberships_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: memberships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE memberships_id_seq OWNED BY memberships.id;


--
-- Name: queue_classic_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE queue_classic_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: queue_classic_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE queue_classic_jobs_id_seq OWNED BY queue_classic_jobs.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE users (
    id integer NOT NULL,
    username character varying(256),
    password_digest character varying(256),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    first_name character varying(256),
    last_name character varying(256),
    email character varying(256),
    title character varying(256),
    dept character varying(256),
    notes text,
    admin boolean DEFAULT false,
    deleted_at timestamp without time zone,
    image_file_name character varying(256),
    image_content_type character varying(256),
    image_file_size integer,
    image_updated_at timestamp without time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: workfile_drafts; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE workfile_drafts (
    id integer NOT NULL,
    workfile_id integer NOT NULL,
    base_version integer,
    owner_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    contents_file_name character varying(256),
    contents_content_type character varying(256),
    contents_file_size integer,
    contents_updated_at timestamp without time zone
);


--
-- Name: workfile_drafts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE workfile_drafts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workfile_drafts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE workfile_drafts_id_seq OWNED BY workfile_drafts.id;


--
-- Name: workfile_versions; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE workfile_versions (
    id integer NOT NULL,
    workfile_id integer NOT NULL,
    version_num integer,
    owner_id integer NOT NULL,
    commit_message character varying(256),
    modifier_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    contents_file_name character varying(256),
    contents_content_type character varying(256),
    contents_file_size integer,
    contents_updated_at timestamp without time zone
);


--
-- Name: workfile_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE workfile_versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workfile_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE workfile_versions_id_seq OWNED BY workfile_versions.id;


--
-- Name: workfiles; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE workfiles (
    id integer NOT NULL,
    workspace_id integer NOT NULL,
    owner_id integer NOT NULL,
    description text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    file_name character varying(255)
);


--
-- Name: workfiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE workfiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workfiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE workfiles_id_seq OWNED BY workfiles.id;


--
-- Name: workspaces; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE workspaces (
    id integer NOT NULL,
    name character varying(256),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    public boolean DEFAULT true,
    archived_at timestamp without time zone,
    archiver_id integer,
    summary text,
    owner_id integer NOT NULL,
    image_file_name character varying(256),
    image_content_type character varying(256),
    image_file_size integer,
    image_updated_at timestamp without time zone,
    deleted_at timestamp without time zone
);


--
-- Name: workspaces_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE workspaces_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workspaces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE workspaces_id_seq OWNED BY workspaces.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY gpdb_database_objects ALTER COLUMN id SET DEFAULT nextval('gpdb_database_objects_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY gpdb_databases ALTER COLUMN id SET DEFAULT nextval('gpdb_databases_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY gpdb_schemas ALTER COLUMN id SET DEFAULT nextval('gpdb_schemas_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY hadoop_instances ALTER COLUMN id SET DEFAULT nextval('hadoop_instances_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY instance_accounts ALTER COLUMN id SET DEFAULT nextval('instance_credentials_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY instances ALTER COLUMN id SET DEFAULT nextval('instances_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY memberships ALTER COLUMN id SET DEFAULT nextval('memberships_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY queue_classic_jobs ALTER COLUMN id SET DEFAULT nextval('queue_classic_jobs_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY workfile_drafts ALTER COLUMN id SET DEFAULT nextval('workfile_drafts_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY workfile_versions ALTER COLUMN id SET DEFAULT nextval('workfile_versions_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY workfiles ALTER COLUMN id SET DEFAULT nextval('workfiles_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY workspaces ALTER COLUMN id SET DEFAULT nextval('workspaces_id_seq'::regclass);


--
-- Name: gpdb_database_objects_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY gpdb_database_objects
    ADD CONSTRAINT gpdb_database_objects_pkey PRIMARY KEY (id);


--
-- Name: gpdb_databases_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY gpdb_databases
    ADD CONSTRAINT gpdb_databases_pkey PRIMARY KEY (id);


--
-- Name: gpdb_schemas_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY gpdb_schemas
    ADD CONSTRAINT gpdb_schemas_pkey PRIMARY KEY (id);


--
-- Name: hadoop_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY hadoop_instances
    ADD CONSTRAINT hadoop_instances_pkey PRIMARY KEY (id);


--
-- Name: instance_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY instance_accounts
    ADD CONSTRAINT instance_credentials_pkey PRIMARY KEY (id);


--
-- Name: instances_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);


--
-- Name: queue_classic_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY queue_classic_jobs
    ADD CONSTRAINT queue_classic_jobs_pkey PRIMARY KEY (id);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workfile_drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY workfile_drafts
    ADD CONSTRAINT workfile_drafts_pkey PRIMARY KEY (id);


--
-- Name: workfile_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY workfile_versions
    ADD CONSTRAINT workfile_versions_pkey PRIMARY KEY (id);


--
-- Name: workfiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY workfiles
    ADD CONSTRAINT workfiles_pkey PRIMARY KEY (id);


--
-- Name: workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);


--
-- Name: idx_qc_on_name_only_unlocked; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX idx_qc_on_name_only_unlocked ON queue_classic_jobs USING btree (q_name, id) WHERE (locked_at IS NULL);


--
-- Name: index_gpdb_database_objects_on_schema_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_gpdb_database_objects_on_schema_id ON gpdb_database_objects USING btree (schema_id);


--
-- Name: index_gpdb_databases_on_instance_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_gpdb_databases_on_instance_id ON gpdb_databases USING btree (instance_id);


--
-- Name: index_gpdb_schemas_on_database_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_gpdb_schemas_on_database_id ON gpdb_schemas USING btree (database_id);


--
-- Name: index_hadoop_instances_on_owner_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_hadoop_instances_on_owner_id ON hadoop_instances USING btree (owner_id);


--
-- Name: index_instance_accounts_on_instance_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_instance_accounts_on_instance_id ON instance_accounts USING btree (instance_id);


--
-- Name: index_instance_accounts_on_owner_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_instance_accounts_on_owner_id ON instance_accounts USING btree (owner_id);


--
-- Name: index_instances_on_owner_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_instances_on_owner_id ON instances USING btree (owner_id);


--
-- Name: index_memberships_on_user_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_memberships_on_user_id ON memberships USING btree (user_id);


--
-- Name: index_memberships_on_workspace_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_memberships_on_workspace_id ON memberships USING btree (workspace_id);


--
-- Name: index_workfile_drafts_on_owner_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_workfile_drafts_on_owner_id ON workfile_drafts USING btree (owner_id);


--
-- Name: index_workfile_drafts_on_workfile_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_workfile_drafts_on_workfile_id ON workfile_drafts USING btree (workfile_id);


--
-- Name: index_workfile_versions_on_modifier_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_workfile_versions_on_modifier_id ON workfile_versions USING btree (modifier_id);


--
-- Name: index_workfile_versions_on_owner_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_workfile_versions_on_owner_id ON workfile_versions USING btree (owner_id);


--
-- Name: index_workfile_versions_on_workfile_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_workfile_versions_on_workfile_id ON workfile_versions USING btree (workfile_id);


--
-- Name: index_workfiles_on_owner_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_workfiles_on_owner_id ON workfiles USING btree (owner_id);


--
-- Name: index_workfiles_on_workspace_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_workfiles_on_workspace_id ON workfiles USING btree (workspace_id);


--
-- Name: index_workspaces_on_archiver_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_workspaces_on_archiver_id ON workspaces USING btree (archiver_id);


--
-- Name: index_workspaces_on_owner_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_workspaces_on_owner_id ON workspaces USING btree (owner_id);


--
-- Name: unique_schema_migrations; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE UNIQUE INDEX unique_schema_migrations ON schema_migrations USING btree (version);


--
-- PostgreSQL database dump complete
--

INSERT INTO schema_migrations (version) VALUES ('20120413003345');

INSERT INTO schema_migrations (version) VALUES ('20120416234945');

INSERT INTO schema_migrations (version) VALUES ('20120417103900');

INSERT INTO schema_migrations (version) VALUES ('20120417105500');

INSERT INTO schema_migrations (version) VALUES ('20120417184201');

INSERT INTO schema_migrations (version) VALUES ('20120418000741');

INSERT INTO schema_migrations (version) VALUES ('20120418211041');

INSERT INTO schema_migrations (version) VALUES ('20120419193206');

INSERT INTO schema_migrations (version) VALUES ('20120419194129');

INSERT INTO schema_migrations (version) VALUES ('20120423191005');

INSERT INTO schema_migrations (version) VALUES ('20120424221335');

INSERT INTO schema_migrations (version) VALUES ('20120427234448');

INSERT INTO schema_migrations (version) VALUES ('20120502001925');

INSERT INTO schema_migrations (version) VALUES ('20120502012345');

INSERT INTO schema_migrations (version) VALUES ('20120502205544');

INSERT INTO schema_migrations (version) VALUES ('20120503221103');

INSERT INTO schema_migrations (version) VALUES ('20120504210541');

INSERT INTO schema_migrations (version) VALUES ('20120504214919');

INSERT INTO schema_migrations (version) VALUES ('20120504235249');

INSERT INTO schema_migrations (version) VALUES ('20120508175301');

INSERT INTO schema_migrations (version) VALUES ('20120508184817');

INSERT INTO schema_migrations (version) VALUES ('20120509004549');

INSERT INTO schema_migrations (version) VALUES ('20120510172734');

INSERT INTO schema_migrations (version) VALUES ('20120510210331');

INSERT INTO schema_migrations (version) VALUES ('20120510211134');

INSERT INTO schema_migrations (version) VALUES ('20120510223528');

INSERT INTO schema_migrations (version) VALUES ('20120510223801');

INSERT INTO schema_migrations (version) VALUES ('20120510224704');

INSERT INTO schema_migrations (version) VALUES ('20120511233557');

INSERT INTO schema_migrations (version) VALUES ('20120517204230');

INSERT INTO schema_migrations (version) VALUES ('20120517221325');

INSERT INTO schema_migrations (version) VALUES ('20120517221427');

INSERT INTO schema_migrations (version) VALUES ('20120518002042');

INSERT INTO schema_migrations (version) VALUES ('20120518002110');

INSERT INTO schema_migrations (version) VALUES ('20120518215640');

INSERT INTO schema_migrations (version) VALUES ('20120519000854');

INSERT INTO schema_migrations (version) VALUES ('20120522000542');

INSERT INTO schema_migrations (version) VALUES ('20120522020546');

INSERT INTO schema_migrations (version) VALUES ('20120523174942');

INSERT INTO schema_migrations (version) VALUES ('20120529165510');

INSERT INTO schema_migrations (version) VALUES ('20120529231954');

INSERT INTO schema_migrations (version) VALUES ('20120530001157');

INSERT INTO schema_migrations (version) VALUES ('20120531165316');

INSERT INTO schema_migrations (version) VALUES ('20120601180858');