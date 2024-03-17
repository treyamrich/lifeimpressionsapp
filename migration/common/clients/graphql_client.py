import json
import logging
import os
import requests
import boto3
from requests_aws4auth import AWS4Auth
from dataclasses import dataclass

GRAPHQL_ENDPOINT = os.environ["API_LIFEIMPRESSIONSAPP_GRAPHQLAPIENDPOINTOUTPUT"]

@dataclass
class Query:
    name: str
    query: str
        

class GraphQLException(Exception):
    def __init__(self, message=""):
        self.message = message
        super().__init__(self.message)


class GraphQLClient:

    def __init__(self):
        self.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "x-api-key": os.environ["API_KEY"],
        }
        
        session = requests.Session()
        credentials = boto3.session.Session().get_credentials()
        session.auth = AWS4Auth(
            credentials.access_key,
            credentials.secret_key,
            boto3.session.Session().region_name,
            'appsync',
            session_token=credentials.token
        )

        self.session = session

    def make_request(self, q: Query, variables: dict):
        response = self.session.request(
            url=GRAPHQL_ENDPOINT,
            method="POST",
            headers=self.headers,
            json={"query": q.query, "variables": variables},
        )
        resp = response.json()
        errors = resp.get("errors", [])
        if len(errors) > 0:
            logging.exception(f"Error executing query '{q.name}'\n{json.dumps(errors, indent=3)}")
            raise GraphQLException
        return resp['data'][q.name]

class PaginationIterator:
    def __init__(self, graphql_client: GraphQLClient, q: Query, variables: dict, always_filter_deleted: bool = False):
        self._graphql_client = graphql_client
        self._q = q
        self._page = []
        self._next_token = None
        self._idx = 0
        self._variables = {**variables}
        
        if always_filter_deleted:
            filters = variables.get("filter", {})
            self._variables["filter"] = {**filters, "isDeleted": {"ne": True}}

    def __iter__(self):
        self._get_next_page()
        return self

    def __next__(self):
        if not self._page:
            raise StopIteration
        
        at_end_of_page = self._idx == len(self._page)
        at_last_page = self._next_token == None

        if at_end_of_page and at_last_page:
            raise StopIteration

        if at_end_of_page:
            self._get_next_page()

        item = self._page[self._idx]
        self._idx += 1
        return item

    def _get_next_page(self):
        resp = self._graphql_client.make_request(self._q, self._variables)
        self._page, self._next_token = resp["items"], resp["nextToken"]
        self._idx = 0
        self._variables["nextToken"] = self._next_token