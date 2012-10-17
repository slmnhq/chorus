module Kaggle
  class UsersController < ApplicationController
    def index
      #TODO api docs
      kaggle_user_filter = URI.decode(params[:kaggle_user]).split(",") if params[:kaggle_user]
      user_list = JSON.parse(File.read(Rails.root + "kaggleSearchResults.json"))

      sorted_user_list = user_list.map do |user_attributes|
        {
            "id" => user_attributes['UserId'],
            "username" => user_attributes['Username'],
            "location" => user_attributes['Location'],
            "rank" => user_attributes['KaggleRank'],
            "points" => user_attributes['KagglePoints'],
            "number_of_competitions" => user_attributes['PastCompetitions'].length,
            "gravatar_url" => user_attributes['Gravatar'],
            "full_name" => user_attributes['LegalName'],
            "past_competition_types" => user_attributes['PastCompetitionTypes']
        }
      end.sort! { |user1, user2| user1['rank'] <=> user2['rank'] }

      sorted_user_list.keep_if do |user_attributes|
        search_through_filter(user_attributes, kaggle_user_filter)
      end

      render :json => {:response => sorted_user_list}, :status => '200'
    end

    #TODO Key map and also see if we need to filter before sorting or vice-versa
    def search_through_filter(user_attributes, filters)
      return_val = true
      return return_val if filters.nil?
      filters.each { |filter|
        key, comparator, value = filter.split("|")
        value = URI.decode(value)
        value = value.to_i if value.try(:to_i).to_s == value.to_s
        case comparator
          when 'greater'
            return_val = return_val && (user_attributes[key] > value)
          when 'less'
            return_val = return_val && (user_attributes[key] < value)
          else #'equal'
            return_val = return_val && (user_attributes[key] == value)
        end
      }
      return_val
    end
  end
end