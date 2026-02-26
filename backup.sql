--
-- PostgreSQL database dump
--

\restrict 10ESCCgdzZNZYtXhmZhvqutPJQeYVy2D4ngchaiXZmP7epHducpGdoqhDUHCQvJ

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notes (
    id integer NOT NULL,
    user_id integer,
    text text NOT NULL,
    completed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notes OWNER TO postgres;

--
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notes_id_seq OWNER TO postgres;

--
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(255) NOT NULL,
    price numeric(12,2) NOT NULL,
    units integer DEFAULT 0 NOT NULL,
    category character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    selling_price numeric DEFAULT 0
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    profit_loss numeric(12,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.sales OWNER TO postgres;

--
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_id_seq OWNER TO postgres;

--
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text,
    admin_password character varying(255),
    worker_password character varying(255),
    shop_name character varying(255),
    reset_token character varying(255),
    reset_token_expiry timestamp without time zone,
    subscription_status character varying(20) DEFAULT 'inactive'::character varying,
    subscription_plan character varying(20),
    subscription_expiry timestamp without time zone,
    paystack_customer_code character varying(100)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: notes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notes (id, user_id, text, completed, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, user_id, name, price, units, category, created_at, selling_price) FROM stdin;
21	9	Dagote Sugar (Medium)	3500.00	2	sweetner	2026-02-03 11:28:25.78162	4000
24	9	aerial (medium) 	4500.00	35	CLEAning agent	2026-02-05 12:05:50.967833	6000
23	9	Camera	50000.00	12	devices	2026-02-03 11:29:53.092111	60000
28	9	Coca cola	400.00	60	Drinks	2026-02-16 10:48:34.360508	600
22	9	quran	6000.00	17	Religous	2026-02-03 11:29:20.019751	8000
27	9	Pens	150.00	15	stationaries	2026-02-07 09:16:53.020312	250
29	9	Coca - cola	400.00	60	Drinks	2026-02-22 10:44:25.115544	500
25	9	chairs	7000.00	37	plastics	2026-02-05 12:29:00.559332	10000
26	9	Caps	3000.00	60	clothings	2026-02-05 12:46:11.027576	5000
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales (id, user_id, product_id, quantity, price, created_at, profit_loss) FROM stdin;
71	9	23	2	120000.00	2026-02-03 11:30:15.107584-08	20000.00
72	9	23	1	60000.00	2026-02-04 10:39:05.732389-08	10000.00
73	9	21	3	12000.00	2026-02-04 11:26:04.315845-08	1500.00
74	9	21	2	8000.00	2026-02-05 11:59:18.925672-08	1000.00
75	9	22	3	24000.00	2026-02-05 11:59:46.69934-08	6000.00
76	9	22	2	16000.00	2026-02-06 08:46:26.499681-08	4000.00
77	9	26	2	10000.00	2026-02-07 09:50:42.469315-08	4000.00
78	9	21	3	12000.00	2026-02-07 10:49:10.087645-08	1500.00
79	9	23	2	120000.00	2026-02-07 10:57:20.508762-08	20000.00
80	9	24	1	6000.00	2026-02-08 05:03:02.650905-08	1500.00
81	9	26	1	5000.00	2026-02-08 05:10:39.829979-08	2000.00
82	9	26	1	5000.00	2026-02-09 06:05:46.781979-08	2000.00
83	9	25	3	30000.00	2026-02-11 03:02:14.781523-08	9000.00
84	9	24	4	24000.00	2026-02-11 03:04:38.480436-08	6000.00
85	9	26	2	10000.00	2026-02-12 04:52:44.602606-08	4000.00
86	9	26	2	10000.00	2026-02-12 05:06:51.830663-08	4000.00
87	9	25	2	20000.00	2026-02-12 05:07:09.296185-08	6000.00
88	9	26	3	15000.00	2026-02-15 01:06:41.370483-08	6000.00
89	9	26	2	10000.00	2026-02-16 06:19:48.350452-08	4000.00
90	9	25	3	30000.00	2026-02-16 06:58:39.165956-08	9000.00
91	9	22	8	64000.00	2026-02-22 07:20:24.382908-08	16000.00
92	9	27	5	1250.00	2026-02-22 10:36:35.128792-08	500.00
93	9	27	5	1000.00	2026-02-22 10:36:54.680353-08	250.00
94	9	27	5	500.00	2026-02-22 10:37:18.575462-08	-250.00
95	9	25	5	50000.00	2026-02-24 07:11:16.418548-08	15000.00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, name, admin_password, worker_password, shop_name, reset_token, reset_token_expiry, subscription_status, subscription_plan, subscription_expiry, paystack_customer_code) FROM stdin;
10	bellohabeebullah862@gmail.com	$2b$10$BBXAs0pbqQ1A8QOdmVnaQOzs6fCMIeJJaPEtC75wrzhQoLOgyElw.	jika	$2b$10$FYsS2RDWLT16iPXx4fdZfufljpBykZ9jjMQ4dMGL/tMxTnk6wvpiG	$2b$10$jYJCFxjKLl4hX4K1iaiXQuNzMnZPf6Lz3CP3JHndNljpy3YBniHZO	jika stores	\N	\N	inactive	\N	\N	\N
9	bellohabeebullah838@gmail.com	$2b$10$Ws1PHl0iNdyhdwWxukgfOexPt0SOBqNe6K.pjicebuwbwlUvjh5n.	BELLO	$2b$10$QlNe8TbBXRHmIYnaISFpcOr5rikmrFqHVaVKKSCOJHCaWvatTIZgC	$2b$10$oYKkTgrQIEiDkWR8hZcdPOtr8Z0p0RwhS1sC7kqPTpkh1Ffz3IN5C	BELLO STORES	\N	\N	inactive	\N	\N	\N
\.


--
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notes_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 29, true);


--
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_id_seq', 95, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 11, true);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: notes notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: products products_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sales sales_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: sales sales_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 10ESCCgdzZNZYtXhmZhvqutPJQeYVy2D4ngchaiXZmP7epHducpGdoqhDUHCQvJ

