module Kaggle
  class UsersController < ApplicationController
    def index
      user_list = JSON.parse(File.read(Rails.root + "kaggleSearchResults.json"))

      sorted_user_list = user_list.map do |user_attributes|
        {
            "id" => user_attributes['UserId'],
            "username" => user_attributes['Username'],
            "location" => user_attributes['Location'],
            "rank" => user_attributes['KaggleRank'],
            "points" => user_attributes['KagglePoints'],
            "number_of_entered_competitions" => user_attributes['PastCompetitions'].length,
            "gravatar_url" => user_attributes['Gravatar'],
            "full_name" => user_attributes['LegalName'],
            "past_competition_types" => user_attributes['PastCompetitionTypes'],
            "favorite_technique" => user_attributes['FavoriteTechnique'],
            "favorite_software" => user_attributes['FavoriteSoftware']
        }
      end.sort! { |user1, user2| user1['rank'] <=> user2['rank'] }

      sorted_user_list.keep_if do |user_attributes|
        search_through_filter(user_attributes, params[:kaggle_user])
      end

      render :json => {:response => sorted_user_list}, :status => '200'
    end

    def search_through_filter(user_attributes, filters)
      return_val = true
      return return_val if filters.nil?
      filters.each { |filter|
        key, comparator, value = filter.split("|")
        next unless value
        value = URI.decode(value)
        value = value.to_i if value.try(:to_i).to_s == value.to_s
        case comparator
          when 'greater'
            return_val = return_val && (user_attributes[key] > value)
          when 'less'
            return_val = return_val && (user_attributes[key] < value)
          else #'equal'
            if key == 'past_competition_types'
              return_val = return_val && (user_attributes[key].map(&:downcase).include?(value.downcase))
            else
              return_val = return_val && (user_attributes[key] == value)
            end
        end
      }
      return_val
    end
  end
end