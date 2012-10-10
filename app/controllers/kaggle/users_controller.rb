module Kaggle
  class UsersController < ApplicationController
    def index
      user_list = JSON.parse(File.read("kaggleSearchResults.json"))

      sorted_user_list = user_list.map do |user_attributes|
        {
            "username" => user_attributes['Username'],
            "location" => user_attributes['Location'],
            "rank" => user_attributes['KaggleRank'],
            "number_of_competitions" => user_attributes['PastCompetitions'].length,
            "gravatar_url" => user_attributes['Gravatar'],
            "full_name" => user_attributes['LegalName']
        }
      end.sort! { |user1, user2| user1['rank'] <=> user2['rank'] }

      render :json => {:response => sorted_user_list}, :status => '200'
    end
  end
end