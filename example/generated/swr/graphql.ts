/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: { input: string; output: string };
	String: { input: string; output: string };
	Boolean: { input: boolean; output: boolean };
	Int: { input: number; output: number };
	Float: { input: number; output: number };
	Date: { input: any; output: any };
};

export type Chat = Node & {
	__typename?: "Chat";
	id: Scalars["ID"]["output"];
	messages: Array<ChatMessage>;
	users: Array<User>;
};

export type ChatMessage = Node & {
	__typename?: "ChatMessage";
	content: Scalars["String"]["output"];
	id: Scalars["ID"]["output"];
	time: Scalars["Date"]["output"];
	user: User;
};

export type Node = {
	id: Scalars["ID"]["output"];
};

export type Query = {
	__typename?: "Query";
	allUsers?: Maybe<Array<Maybe<User>>>;
	me: User;
	myChats: Array<Chat>;
	search: Array<SearchResult>;
	user?: Maybe<User>;
};

export type QuerySearchArgs = {
	term: Scalars["String"]["input"];
};

export type QueryUserArgs = {
	id: Scalars["ID"]["input"];
};

export enum Role {
	Admin = "ADMIN",
	User = "USER",
}

export type SearchResult = Chat | ChatMessage | User;

export type User = Node & {
	__typename?: "User";
	email: Scalars["String"]["output"];
	id: Scalars["ID"]["output"];
	role: Role;
	username: Scalars["String"]["output"];
};

export type FindUserQueryVariables = Exact<{
	userId: Scalars["ID"]["input"];
}>;

export type FindUserQuery = {
	__typename?: "Query";
	user?: ({ __typename?: "User" } & { " $fragmentRefs"?: { UserFieldsFragment: UserFieldsFragment } }) | null;
};

export type UserFieldsFragment = { __typename?: "User"; id: string; username: string; role: Role } & {
	" $fragmentName"?: "UserFieldsFragment";
};

export const UserFieldsFragmentDoc = {
	kind: "Document",
	definitions: [
		{
			kind: "FragmentDefinition",
			name: { kind: "Name", value: "UserFields" },
			typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
			selectionSet: {
				kind: "SelectionSet",
				selections: [
					{ kind: "Field", name: { kind: "Name", value: "id" } },
					{ kind: "Field", name: { kind: "Name", value: "username" } },
					{ kind: "Field", name: { kind: "Name", value: "role" } },
				],
			},
		},
	],
} as unknown as DocumentNode<UserFieldsFragment, unknown>;
export const FindUserDocument = {
	kind: "Document",
	definitions: [
		{
			kind: "OperationDefinition",
			operation: "query",
			name: { kind: "Name", value: "findUser" },
			variableDefinitions: [
				{
					kind: "VariableDefinition",
					variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
					type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "ID" } } },
				},
			],
			selectionSet: {
				kind: "SelectionSet",
				selections: [
					{
						kind: "Field",
						name: { kind: "Name", value: "user" },
						arguments: [
							{
								kind: "Argument",
								name: { kind: "Name", value: "id" },
								value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
							},
						],
						selectionSet: {
							kind: "SelectionSet",
							selections: [{ kind: "FragmentSpread", name: { kind: "Name", value: "UserFields" } }],
						},
					},
				],
			},
		},
		{
			kind: "FragmentDefinition",
			name: { kind: "Name", value: "UserFields" },
			typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
			selectionSet: {
				kind: "SelectionSet",
				selections: [
					{ kind: "Field", name: { kind: "Name", value: "id" } },
					{ kind: "Field", name: { kind: "Name", value: "username" } },
					{ kind: "Field", name: { kind: "Name", value: "role" } },
				],
			},
		},
	],
} as unknown as DocumentNode<FindUserQuery, FindUserQueryVariables>;
