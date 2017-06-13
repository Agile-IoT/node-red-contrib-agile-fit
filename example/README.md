# Example workflow
This example accesses the shimmer container with pre-configured API keys 
and returns data from Google Fit

## Prerequisites
 * openmHealth shimmer docker container + database 

## Running

import workflow into nodered
 * Configure url of shimmer server (default http://localhost:8083) and cloud provider (default:googlefit) 
 * case 1: Not authenticated: If we access through the webservice <ip>/<api>/auth?username?<username>
	we will be redirected to the cloud service authentication page
 * case 2: Authenticated: We can access the data with shimmer_getData

	 
